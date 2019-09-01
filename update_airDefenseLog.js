//0.1.4

//import js method
load("script/ScriptData.js");
/**  ScriptData.jsで使用 */
data_prefix = "AirDefenseLog_";

AirBattleDto = Java.type("logbook.dto.AirBattleDto");
DataType = Java.type("logbook.data.DataType");
BattleExDto = Java.type("logbook.dto.BattleExDto");
Item = Java.type("logbook.internal.Item");
Ship = Java.type("logbook.internal.Ship");
EnemyShipDto = Java.type("logbook.dto.EnemyShipDto");
ArrayList = Java.type("java.util.ArrayList");
ZonedDateTime = Java.type("java.time.ZonedDateTime");
ZoneId = Java.type("java.time.ZoneId");
DateTimeFormatter = Java.type("java.time.format.DateTimeFormatter");
PrintWriter = Java.type("java.io.PrintWriter");
Files = Java.type("java.nio.file.Files");
Paths = Java.type("java.nio.file.Paths");
Charset = Java.type("java.nio.charset.Charset");
StandardOpenOption = Java.type("java.nio.file.StandardOpenOption");
MasterData = Java.type("logbook.internal.MasterData");
Collectors = Java.type("java.util.stream.Collectors");
GlobalContext = Java.type("logbook.data.context.GlobalContext");

var MAX_AIRBASE_NUM = 3
var MAX_SQUADRON_NUM = 4;
var MAX_ENEMY_SHIP_NUM = 6;
var MAX_ITEM_NUM = 5;
var PARAM_NUM = 4;
var PATH = Paths.get("基地航空隊(防空).csv");
var PATH2 = Paths.get("基地航空隊(防空)_alternative.csv");

function update(type, data) {
    var json = data.getJsonObject();
    switch (type) {
        case DataType.MAPINFO: {
            saveAirBase(json)
            break;
        }
        case DataType.NEXT: {
            parseNext(json);
            break;
        }
        default: {
            break;
        }
    }
}

function saveAirBase(json) {
    var airbase = json.api_data.api_air_base.stream().collect(Collectors.groupingBy(function (data) {
        return data.api_area_id.intValue();
    }));
    setTmpData("AirBase", airbase);
}

function parseNext(json) {
    if (!hasDestructionBattle(json)) return;
    var battle = new DestructionBattleDto(json);
    write(format(battle));
}

function hasDestructionBattle(json) {
    return json.api_data.api_destruction_battle != null;
}

function DestructionBattleDto(json) {
    this.time = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
    var map = json.api_data;
    this.mapAreaId = map.api_maparea_id.intValue();
    this.mapInfoNo = map.api_mapinfo_no.intValue();
    this.no = map.api_no.intValue();
    this.eventId = map.api_event_id.intValue();
    this.eventKind = map.api_event_kind.intValue();
    var data = map.api_destruction_battle;
    this.formation = parseIntArray(data.api_formation); //使わない
    this.formationString = [toFormation(data.api_formation[0].intValue()), toFormation(data.api_formation[1].intValue())];
    this.match = data.api_formation[2].intValue();
    this.matchString = toMatch(data.api_formation[2].intValue());
    this.enemys = getEnemyDataList(data);
    this.lostKind = data.api_lost_kind.intValue(); //使わない
    this.lostKindString = toLostKindShortString(data.api_lost_kind.intValue());
    this.airBaseAttack = new AirBaseAttack(data.api_air_base_attack);
    this.nowhps = parseIntArray(data.api_e_nowhps);
    this.maxhps = parseIntArray(data.api_e_maxhps);
}

function AirBaseAttack(data) {
    this.stageFlag = parseIntArray(data.api_stage_flag); //[1,0,1] 使わない
    this.planeFrom = data.api_plane_from; //使わない
    this.squadronPlane = data.api_map_squadron_plane;
    this.stage1 = new Stage1(data.api_stage1);
    this.stage2 = data.api_stage2; //null 使わない
    this.stage3 = new Stage3(data.api_stage3);
}

function Stage1(data) {
    this.fCount = data.api_f_count.intValue();
    this.fLostCount = data.api_f_lostcount.intValue();
    this.eCount = data.api_e_count.intValue();
    this.eLostCount = data.api_e_lostcount.intValue();
    this.dispSeiku = data.api_disp_seiku.intValue(); //使わない
    this.dispSeikuString = toSeiku(this.dispSeiku);
    this.touchPlane = parseIntArray(data.api_touch_plane); //使わない
    this.touchPlaneString = toTouchPlaneString(this.touchPlane);
}

function Stage3(data) {
    this.fRaiFlag = data == "null" ? [] : parseIntArray(data.api_frai_flag);
    this.eRaiFlag = data == "null" ? [] : parseIntArray(data.api_erai_flag);
    this.fBakFlag = data == "null" ? [] : parseIntArray(data.api_fbak_flag);
    this.eBakFlag = data == "null" ? [] : parseIntArray(data.api_ebak_flag);
    this.fClFlag = data == "null" ? [] : parseIntArray(data.api_fcl_flag);
    this.eClFlag = data == "null" ? [] : parseIntArray(data.api_ecl_flag);
    this.fDam = data == "null" ? [] : parseIntArray(data.api_fdam);
    this.eDam = data == "null" ? [] : parseIntArray(data.api_edam);
}

function format(dto) {
    var result = [];
    result.push(dto.time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
    result.push(MasterData.getMapInfo(dto.mapAreaId, dto.mapInfoNo).getName());
    result.push("マップ:" + dto.mapAreaId + "-" + dto.mapInfoNo + " セル:" + dto.no + " (" + getNextKind(dto.eventId, dto.eventKind) + ")");
    result.push(dto.formationString[0]);
    result.push(dto.formationString[1]);
    result.push(dto.matchString);
    result.push(dto.lostKindString);
    Array.prototype.push.apply(result, stage1Format(dto.airBaseAttack.stage1));
    Array.prototype.push.apply(result, squadronFormat(dto.airBaseAttack.squadronPlane, dto.mapAreaId, dto.nowhps, dto.maxhps));
    Array.prototype.push.apply(result, enemyFormat(dto.enemys));
    Array.prototype.push.apply(result, stage3Format(dto.airBaseAttack.stage3));
    return result.join(",");
}

function squadronFormat(squadronPlane, areaId, nowhps, maxhps) {
    var result = [];
    var airbase = getData("AirBase");
    for (var i = 0; i < MAX_AIRBASE_NUM; i++) {
        result.push(nowhps[i] + "/" + maxhps[i]);
        if (squadronPlane == "null" || squadronPlane[String(i + 1)] == null) {
            for (var j = 0; j < MAX_ITEM_NUM * PARAM_NUM; j++) {
                result.push("");
            }
        } else {
            var squadron = squadronPlane[String(i + 1)]; // "1" or "2" or "3"
            for (var j = 0; j < PARAM_NUM; j++) {
                if (squadron.length <= j || squadron[j].api_mst_id === undefined) {
                    Array.prototype.push.apply(result, ["", "", "", "", ""]);
                } else {
                    result.push(Item.get(squadron[j].api_mst_id.intValue()).getName());
                    try { //艦載機にズレがないかを調べる(装備IDしかわからないが一応)
                        var squadronAtSortie = airbase.get(areaId)[i].api_plane_info[j];
                        var uniqueIdAtSortie = squadronAtSortie.api_slotid.intValue();
                        var slotid = squadron[j].api_mst_id.intValue();
                        var item = GlobalContext.getItem(uniqueIdAtSortie);
                        var cond = squadronAtSortie.api_cond.intValue();
                        if (slotid != 0) {
                            if (item.slotitemId == slotid) {
                                result.push(item.getLevel());
                                result.push(item.getAlv());
                                result.push(toCondString(cond));
                            } else {
                                throw new Error("No Match");
                            }
                        } else {
                            Array.prototype.push.apply(result, ["", "", ""]);
                        }
                    } catch (e) {
                        Array.prototype.push.apply(result, ["不明", "不明", "不明"]);
                    }
                    result.push(squadron[j].api_count.intValue());
                }
            }
        }
    }
    return result;
}

function enemyFormat(enemys) {
    var result = [];
    for (var i = 0; i < MAX_ENEMY_SHIP_NUM; i++) {
        if (enemys.size() > i) {
            var enemy = enemys.get(i);
            result.push(enemy.id);
            result.push(enemy.name);
            result.push(enemy.lv);
            result.push(enemy.nowhp + "/" + enemy.maxhp);
            for (var j = 0; j < MAX_ITEM_NUM; j++) {
                var slotid = enemy.slots[j];
                if (slotid == -1) {
                    result.push("");
                } else {
                    result.push(Item.get(slotid).getName());
                }
            }
        } else {
            result = result.concat(Array.apply(null, new Array(4 + MAX_ITEM_NUM)).map(String.prototype.valueOf,""));
        }
    }
    return result;
}

function stage1Format(stage1) {
    var result = [];
    result.push(stage1.fCount);
    result.push(stage1.fLostCount);
    result.push(stage1.eCount);
    result.push(stage1.eLostCount);
    result.push(stage1.dispSeikuString);
    result.push(stage1.touchPlaneString[0]);
    result.push(stage1.touchPlaneString[1]);
    return result;
}

function stage3Format(stage3) {
    var result = [];
    for (var i = 0; i < MAX_AIRBASE_NUM; i++) {
        result.push(stage3.fRaiFlag.length > i ? stage3.fRaiFlag[i] : "");
    }
    for (var i = 0; i < MAX_ENEMY_SHIP_NUM; i++) {
        result.push(stage3.eRaiFlag.length > i ? stage3.eRaiFlag[i] : "");
    }
    for (var i = 0; i < MAX_AIRBASE_NUM; i++) {
        result.push(stage3.fBakFlag.length > i ? stage3.fBakFlag[i] : "");
    }
    for (var i = 0; i < MAX_ENEMY_SHIP_NUM; i++) {
        result.push(stage3.eBakFlag.length > i ? stage3.eBakFlag[i] : "");
    }
    for (var i = 0; i < MAX_AIRBASE_NUM; i++) {
        result.push(stage3.fClFlag.length > i ? stage3.fClFlag[i] : "");
    }
    for (var i = 0; i < MAX_ENEMY_SHIP_NUM; i++) {
        result.push(stage3.eClFlag.length > i ? stage3.eClFlag[i] : "");
    }
    for (var i = 0; i < MAX_AIRBASE_NUM; i++) {
        result.push(stage3.fDam.length > i ? stage3.fDam[i] : "");
    }
    for (var i = 0; i < MAX_ENEMY_SHIP_NUM; i++) {
        result.push(stage3.eDam.length > i ? stage3.eDam[i] : "");
    }
    return result;
}

function write(s, p) {
    try {
        var pw;
        var path = p === undefined ? PATH : p;
        if (Files.notExists(path)) {
            pw = new PrintWriter(Files.newBufferedWriter(path, Charset.defaultCharset()));
            pw.println(getHeader());
        } else {
            pw = new PrintWriter(Files.newBufferedWriter(path, Charset.defaultCharset(), StandardOpenOption.WRITE, StandardOpenOption.APPEND));
        }
        pw.println(s);
        pw.close();
    } catch (e) {
        e.printStackTrace();
        if (!path.equals(PATH2)) {
            write(s, PATH2); //再試行
        }
    }
}


function toFormation(f) {
    switch (f) {
        case 1: return "単縦陣";
        case 2: return "複縦陣";
        case 3: return "輪形陣";
        case 4: return "梯形陣";
        case 5: return "単横陣";
        case 6: return "警戒陣";
        case 11: return "第一警戒航行序列";
        case 12: return "第二警戒航行序列";
        case 13: return "第三警戒航行序列";
        case 14: return "第四警戒航行序列";
        default: return "不明(" + f + ")";
    }
}

function toMatch(id) {
    switch (id) {
        case 1: return "同航戦";
        case 2: return "反航戦";
        case 3: return "Ｔ字有利";
        case 4: return "Ｔ字不利";
        default: return "不明(" + id + ")";
    }
}

function getEnemyDataList(data) {
    var enemys = new ArrayList();
    for (var i = 0; i < data.api_ship_ke.length; i++) {
        var id = data.api_ship_ke[i].intValue();
        var name = Ship.get(data.api_ship_ke[i].intValue()).getFullName();
        var lv = data.api_ship_lv[i].intValue();
        var slots = parseIntArray(data.api_eSlot[i]);
        var nowhp = data.api_e_nowhps[i].intValue();
        var maxhp = data.api_e_maxhps[i].intValue();
        enemys.add({ id: id, name: name, lv: lv, slots: slots, nowhp: nowhp, maxhp: maxhp });
    }
    return enemys;
}

function toLostKindString(kind) {
    switch (kind) {
        case 1: return "空襲により備蓄資源に損害を受けました！";
        case 2: return "空襲により備蓄資源に損害を受け、基地航空隊にも地上撃破の損害が発生しました！";
        case 3: return "空襲により基地航空隊に地上撃破の損害が発生しました！";
        case 4: return "空襲による基地の損害はありません。";
        default: return "不明(" + kind + ")";
    }
}

function toLostKindShortString(kind) {
    switch (kind) {
        case 1: return "資源損害";
        case 2: return "資源・航空";
        case 3: return "航空隊損害";
        case 4: return "損害なし";
        default: return "不明(" + kind + ")";
    }
}

function toSeiku(id) {
    switch (id) {
        case 0: return "制空均衡";
        case 1: return "制空権確保";
        case 2: return "航空優勢";
        case 3: return "航空劣勢";
        case 4: return "制空権喪失";
        default: return "不明(" + kind + ")";
    }
}

function toTouchPlaneString(touchPlane) {
    if (touchPlane == null) {
        return ["", ""];
    }
    var ret = [];
    for (var i = 0; i <= 1; i++) {
        if (touchPlane[i] == -1) {
            ret[i] = "なし";
        } else {
            var item = Item.get(touchPlane[i]);
            if (item != null) {
                ret[i] = item.getName();
            }
            else {
                ret[i] = "あり（機体不明[" + touchPlane[i] + "]）";
            }
        }
    }
    return ret;
}

function parseIntArray(array) {
    return array.stream().map(function (data) {
        return data.intValue();
    }).toArray();
}

function getNextKind(eventId, eventKind) {
    switch (eventId) {
        case 0: return "初期地点";
        // case 1: return "不明(1)";
        case 2: return "資源獲得";
        case 3: return "渦潮";
        case 4: return "戦闘";
        case 5: return "ボス";
        case 6: return "気のせい";
        case 7: {
            switch (eventKind) {
                case 0: return "航空偵察";
                case 4: return "航空戦";
                default: return "不明(7/" + eventKind + ")";
            }
        }
        case 8: return "船団護衛成功";
        case 9: return "揚陸地点";
        case 10: return "長距離空襲戦";
        default: return "不明(" + eventId + ")";
    }
}

function toCondString(cond) {
    switch (cond) {
        case 1: return "通常";
        case 2: return "橙疲労";
        case 3: return "赤疲労";
        default: return "不明(" + cond + ")";
    }
}

function getHeader() {
    var result = [];
    result.push("日付");
    result.push("海域");
    result.push("マス");
    result.push("自陣形");
    result.push("敵陣形");
    result.push("会敵");
    result.push("被害");
    result.push("自機数");
    result.push("自機喪失数");
    result.push("敵機数");
    result.push("敵機喪失数");
    result.push("制空権");
    result.push("自触接");
    result.push("敵触接");
    for (var i = 1; i <= MAX_AIRBASE_NUM; i++) {
        result.push("基地" + i + ".HP");
        for (var j = 1; j <= MAX_SQUADRON_NUM; j++) {
            result.push("基地" + i + ".中隊" + j + ".名前");
            result.push("基地" + i + ".中隊" + j + ".改修");
            result.push("基地" + i + ".中隊" + j + ".熟練度");
            result.push("基地" + i + ".中隊" + j + ".疲労");
            result.push("基地" + i + ".中隊" + j + ".機数");
        }
    }
    for (var i = 1; i <= MAX_ENEMY_SHIP_NUM; i++) {
        result.push("敵艦" + i + ".ID");
        result.push("敵艦" + i + ".名前");
        result.push("敵艦" + i + ".Lv");
        result.push("敵艦" + i + ".HP");
        for (var j = 1; j <= MAX_ITEM_NUM; j++) {
            result.push("敵艦" + i + ".装備" + j + ".名前");
        }
    }
    var suffix = ["被雷flag", "被爆flag", "被CLflag", "被ダメ"]
    for (var j = 0; j < suffix.length; j++) {
        for (var i = 1; i <= MAX_AIRBASE_NUM; i++) {
            result.push("基地" + i + "." + suffix[j]);
        }
        for (var i = 1; i <= MAX_ENEMY_SHIP_NUM; i++) {
            result.push("敵艦" + i + "." + suffix[j]);
        }
    }
    return result.join(",");
}
