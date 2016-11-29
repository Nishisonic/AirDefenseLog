//0.0.1

//import js method
load("script/ScriptData.js");
/**  ScriptData.jsで使用 */
data_prefix = "AirDefenseLog_";

AirBattleDto       = Java.type("logbook.dto.AirBattleDto");
DataType           = Java.type("logbook.data.DataType");
BattleExDto        = Java.type("logbook.dto.BattleExDto");
Item               = Java.type("logbook.internal.Item");
Ship               = Java.type("logbook.internal.Ship");
EnemyShipDto       = Java.type("logbook.dto.EnemyShipDto");
ArrayList          = Java.type("java.util.ArrayList");
ZonedDateTime      = Java.type("java.time.ZonedDateTime");
ZoneId             = Java.type("java.time.ZoneId");
DateTimeFormatter  = Java.type("java.time.format.DateTimeFormatter");
PrintWriter        = Java.type("java.io.PrintWriter");
Files              = Java.type("java.nio.file.Files");
Paths              = Java.type("java.nio.file.Paths");
Charset            = Java.type("java.nio.charset.Charset");
StandardOpenOption = Java.type("java.nio.file.StandardOpenOption");
MasterData         = Java.type("logbook.internal.MasterData");
Collectors         = Java.type("java.util.stream.Collectors");
GlobalContext      = Java.type("logbook.data.context.GlobalContext");

var PATH = Paths.get("基地航空隊(防空).csv");
var HEADER = "日付,海域,マス,自陣形,敵陣形,会敵,被害,自機数,自機喪失数,敵機数,敵機喪失数,制空権,自触接,敵触接,第一基地.第一中隊.ID,第一基地.第一中隊.名前,第一基地.第一中隊.名前,第一基地.第一中隊.熟練度,第一基地.第一中隊.機数,第一基地.第二中隊.ID,第一基地.第二中隊.名前,第一基地.第二中隊.改修,第一基地.第二中隊.熟練度,第一基地.第二中隊.機数,第一基地.第三中隊.ID,第一基地.第三中隊.名前,第一基地.第三中隊.改修,第一基地.第三中隊.熟練度,第一基地.第三中隊.機数,第一基地.第四中隊.ID,第一基地.第四中隊.名前,第一基地.第四中隊.改修,第一基地.第四中隊.熟練度,第一基地.第四中隊.機数,第二基地.第一中隊.ID,第二基地.第一中隊.名前,第二基地.第一中隊.改修,第二基地.第一中隊.熟練度,第二基地.第一中隊.機数,第二基地.第二中隊.ID,第二基地.第二中隊.名前,第二基地.第二中隊.改修,第二基地.第二中隊.熟練度,第二基地.第二中隊.機数,第二基地.第三中隊.ID,第二基地.第三中隊.名前,第二基地.第三中隊.改修,第二基地.第三中隊.熟練度,第二基地.第三中隊.機数,第二基地.第四中隊.ID,第二基地.第四中隊.名前,第二基地.第四中隊.改修,第二基地.第四中隊.熟練度,第二基地.第四中隊.機数,第三基地.第一中隊.ID,第三基地.第一中隊.名前,第三基地.第一中隊.改修,第三基地.第一中隊.熟練度,第三基地.第一中隊.機数,第三基地.第二中隊.ID,第三基地.第二中隊.名前,第三基地.第二中隊.改修,第三基地.第二中隊.熟練度,第三基地.第二中隊.機数,第三基地.第三中隊.ID,第三基地.第三中隊.名前,第三基地.第三中隊.改修,第三基地.第三中隊.熟練度,第三基地.第三中隊.機数,第三基地.第四中隊.ID,第三基地.第四中隊.名前,第三基地.第四中隊.改修,第三基地.第四中隊.熟練度,第三基地.第四中隊.機数,,敵艦1.ID,敵艦1.名前,敵艦1.Lv,敵艦1.HP,敵艦1.装備1.ID,敵艦1.装備1.名前,敵艦1.装備2.ID,敵艦1.装備2.名前,敵艦1.装備3.ID,敵艦1.装備3.名前,敵艦1.装備4.ID,敵艦1.装備4.名前,敵艦1.装備5.ID,敵艦1.装備5.名前,敵艦2.ID,敵艦2.名前,敵艦2.Lv,敵艦2.HP,敵艦2.装備1.ID,敵艦2.装備1.名前,敵艦2.装備2.ID,敵艦2.装備2.名前,敵艦2.装備3.ID,敵艦2.装備3.名前,敵艦2.装備4.ID,敵艦2.装備4.名前,敵艦2.装備5.ID,敵艦2.装備5.名前,敵艦3.ID,敵艦3.名前,敵艦3.Lv,敵艦3.HP,敵艦3.装備1.ID,敵艦3.装備1.名前,敵艦3.装備2.ID,敵艦3.装備2.名前,敵艦3.装備3.ID,敵艦3.装備3.名前,敵艦3.装備4.ID,敵艦3.装備4.名前,敵艦3.装備5.ID,敵艦3.装備5.名前,敵艦4.ID,敵艦4.名前,敵艦4.Lv,敵艦4.HP,敵艦4.装備1.ID,敵艦4.装備1.名前,敵艦4.装備2.ID,敵艦4.装備2.名前,敵艦4.装備3.ID,敵艦4.装備3.名前,敵艦4.装備4.ID,敵艦4.装備4.名前,敵艦4.装備5.ID,敵艦4.装備5.名前,敵艦5.ID,敵艦5.名前,敵艦5.Lv,敵艦5.HP,敵艦5.装備1.ID,敵艦5.装備1.名前,敵艦5.装備2.ID,敵艦5.装備2.名前,敵艦5.装備3.ID,敵艦5.装備3.名前,敵艦5.装備4.ID,敵艦5.装備4.名前,敵艦5.装備5.ID,敵艦5.装備5.名前,敵艦6.ID,敵艦6.名前,敵艦6.Lv,敵艦6.HP,敵艦6.装備1.ID,敵艦6.装備1.名前,敵艦6.装備2.ID,敵艦6.装備2.名前,敵艦6.装備3.ID,敵艦6.装備3.名前,敵艦6.装備4.ID,敵艦6.装備4.名前,敵艦6.装備5.ID,敵艦6.装備5.名前,自軍1被雷flag,自軍2被雷flag,自軍3被雷flag,自軍4被雷flag,自軍5被雷flag,自軍6被雷flag,敵艦1被雷flag,敵艦2被雷flag,敵艦3被雷flag,敵艦4被雷flag,敵艦5被雷flag,敵艦6被雷flag,自軍1被爆flag,自軍2被爆flag,自軍3被爆flag,自軍4被爆flag,自軍5被爆flag,自軍6被爆flag,敵艦1被爆flag,敵艦2被爆flag,敵艦3被爆flag,敵艦4被爆flag,敵艦5被爆flag,敵艦6被爆flag,自軍1被CLflag,自軍2被CLflag,自軍3被CLflag,自軍4被CLflag,自軍5被CLflag,自軍6被CLflag,敵艦1被CLflag,敵艦2被CLflag,敵艦3被CLflag,敵艦4被CLflag,敵艦5被CLflag,敵艦6被CLflag,自軍1被Dmg.,自軍2被Dmg.,自軍3被Dmg.,自軍4被Dmg.,自軍5被Dmg.,自軍6被Dmg.,敵艦1被Dmg.,敵艦2被Dmg.,敵艦3被Dmg.,敵艦4被Dmg.,敵艦5被Dmg.,敵艦6被Dmg.";

function update(type, data){
    var json = data.getJsonObject();
    switch(type){
        case DataType.MAPINFO:{
            saveAirBase(json)
            break;
        }
        case DataType.NEXT:{
            parseNext(json);
            break;
        }
    }
}

function saveAirBase(json){
    var airbase = json.api_data.api_air_base.stream().collect(Collectors.groupingBy(function(data){
        return data.api_area_id.intValue();
    }));
    setTmpData("AirBase",airbase);
}

function parseNext(json){
    if(!hasDestructionBattle(json)) return;
    var battle = new DestructionBattleDto(json);
    write(format(battle));
}

function hasDestructionBattle(json){
    return json.api_data.api_destruction_battle !== undefined;
}

function DestructionBattleDto(json){
    this.time             = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
    var map               = json.api_data;
    this.mapAreaId        = map.api_maparea_id.intValue();
    this.mapInfoNo        = map.api_mapinfo_no.intValue();
    this.no               = map.api_no.intValue();
    this.eventId          = map.api_event_id.intValue();
    this.eventKind        = map.api_event_kind.intValue();
    var data              = map.api_destruction_battle;
    this.formation        = parseIntArray(data.api_formation); //使わない
    this.formationString  = [toFormation(data.api_formation[0].intValue()),toFormation(data.api_formation[1].intValue())];
    this.match            = data.api_formation[2].intValue();
    this.matchString      = toMatch(data.api_formation[2].intValue());
    this.enemys           = getEnemyDataList(data);
    this.lostKind         = data.api_lost_kind.intValue(); //使わない
    this.lostKindString   = toLostKindShortString(data.api_lost_kind.intValue());
    this.airBaseAttack    = new AirBaseAttack(data.api_air_base_attack);
}

function AirBaseAttack(data){
    this.stageFlag     = parseIntArray(data.api_stage_flag); //[1,0,1] 使わない
    this.planeFrom     = data.api_plane_from; //使わない
    this.squadronPlane = data.api_squadron_plane;
    this.stage1        = new Stage1(data.api_stage1);
    this.stage2        = data.api_stage2; //null 使わない
    this.stage3        = new Stage3(data.api_stage3);
}

function Stage1(data){
    this.fCount     = data.api_f_count.intValue();
    this.fLostCount = data.api_f_lostcount.intValue();
    this.eCount     = data.api_e_count.intValue();
    this.eLostCount = data.api_e_lostcount.intValue();
    this.dispSeiku  = data.api_disp_seiku.intValue(); //使わない
    this.dispSeikuString = toSeiku(data.api_disp_seiku.intValue());
    this.touchPlane = parseIntArray(data.api_touch_plane); //使わない
    this.touchPlaneString = toTouchPlaneString(parseIntArray(data.api_touch_plane));
}

function Stage3(data){
    var array = [-1,null,null,null,null,null,null];
    this.fRaiFlag = data == "null" ? array : parseIntArray(data.api_frai_flag);
    this.eRaiFlag = data == "null" ? array : parseIntArray(data.api_erai_flag); //[-1,0,0,0,0,0,0]
    this.fBakFlag = data == "null" ? array : parseIntArray(data.api_fbak_flag);
    this.eBakFlag = data == "null" ? array : parseIntArray(data.api_ebak_flag); //[-1,0,0,0,0,0,0]
    this.fClFlag  = data == "null" ? array : parseIntArray(data.api_fcl_flag);
    this.eClFlag  = data == "null" ? array : parseIntArray(data.api_ecl_flag); //[-1,0,0,0,0,0,0]
    this.fDam     = data == "null" ? array : parseIntArray(data.api_fdam);
    this.eDam     = data == "null" ? array : parseIntArray(data.api_edam); //[-1,0,0,0,0,0,0]
}

function format(dto){
    var result = [];
    result.push(dto.time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
    result.push(MasterData.getMapInfo(dto.mapAreaId,dto.mapInfoNo).getName());
    result.push("マップ:" + dto.mapAreaId + "-" + dto.mapInfoNo + " セル:" + dto.no + " (" + getNextKind(dto.eventId,dto.eventKind) + ")");
    result.push(dto.formationString[0]);
    result.push(dto.formationString[1]);
    result.push(dto.matchString);
    result.push(dto.lostKindString);
    Array.prototype.push.apply(result,stage1Format(dto.airBaseAttack.stage1));
    Array.prototype.push.apply(result,squadronFormat(dto.airBaseAttack.squadronPlane,dto.mapAreaId));
    Array.prototype.push.apply(result,enemyFormat(dto.enemys));
    Array.prototype.push.apply(result,stage3Format(dto.airBaseAttack.stage3));
    return result.join(",");
}

function squadronFormat(squadronPlane,areaId){
    var result = [];
    var airbase = getData("AirBase");
    for(var i = 1;i <= 3;i++){ 
        if(squadronPlane.size() <= i){
            for(var j = 0;j < 20;j++){
                result.push("");
            }
        } else {
            var squadron = squadronPlane[i];
            for(var j = 0;j < 4;j++){
                if(squadron.size() <= j || squadron[j].api_mst_id === undefined){
                    result.push("");
                    result.push("");
                    result.push("");
                    result.push("");
                    result.push("");
                } else {
                    result.push(squadron[j].api_mst_id.intValue());
                    result.push(Item.get(squadron[j].api_mst_id.intValue()).getName());
                    try{ //艦載機にズレがないかを調べる(装備IDしかわからないが一応)
                        var squadronAtSortie = airbase.get(areaId)[i - 1].api_plane_info[j];
                        var uniqueIdAtSortie = squadronAtSortie.api_slotid.intValue();
                        var slotid           = squadron[j].api_mst_id.intValue();
                        var item             = GlobalContext.getItem(uniqueIdAtSortie);
                        if(slotid != 0){
                            if(item.slotitemId == slotid){
                                result.push(item.getLevel());
                                result.push(item.getAlv());
                            } else {
                                throw new Error("No Match");
                            }
                        } else {
                            result.push("");
                            result.push("");
                        }
                    } catch(e) {
                        result.push("不明");
                        result.push("不明");
                    }
                    result.push(squadron[j].api_count.intValue());
                }
            }
        }
    }
    return result;
}

function enemyFormat(enemys){
    var result = [];
    for(var i = 0;i < 6;i++){
        var enemy = enemys.get(i);
        result.push(enemy.id);
        result.push(enemy.name);
        result.push(enemy.lv);
        result.push(enemy.nowhp + "/" + enemy.maxhp);
        for(var j = 0;j < 5;j++){
            var slotid = enemy.slots[j];
            result.push(slotid);
            if(slotid == -1){
                result.push("");
            } else {
                result.push(Item.get(slotid).getName());
            }
        }
    }
    return result;
}

function stage1Format(stage1){
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

function stage3Format(stage3){
    var result = [];
    for(var i = 1;i <= 6;i++){
        result.push(stage3.fRaiFlag[i]);
    }
    for(var i = 1;i <= 6;i++){
        result.push(stage3.eRaiFlag[i]);
    }
    for(var i = 1;i <= 6;i++){
        result.push(stage3.fBakFlag[i]);
    }
    for(var i = 1;i <= 6;i++){
        result.push(stage3.eBakFlag[i]);
    }
    for(var i = 1;i <= 6;i++){
        result.push(stage3.fClFlag[i]);
    }
    for(var i = 1;i <= 6;i++){
        result.push(stage3.eClFlag[i]);
    }
    for(var i = 1;i <= 6;i++){
        result.push(stage3.fDam[i]);
    }
    for(var i = 1;i <= 6;i++){
        result.push(stage3.eDam[i]);
    }
    return result;
}

function write(s){
    try{
        var pw;
        if(Files.notExists(PATH)){
            pw = new PrintWriter(Files.newBufferedWriter(PATH,Charset.defaultCharset()));
            pw.println(HEADER);
        } else {
            pw = new PrintWriter(Files.newBufferedWriter(PATH,Charset.defaultCharset(),StandardOpenOption.WRITE,StandardOpenOption.APPEND));
        }
        pw.println(s);
        pw.close();
    } catch(e) {
        e.printStackTrace();
    }
}


function toFormation(f){
    switch(f){
        case  1:return "単縦陣";
        case  2:return "複縦陣";
        case  3:return "輪形陣";
        case  4:return "梯形陣";
        case  5:return "単横陣";
        case 11:return "第一警戒航行序列";
        case 12:return "第二警戒航行序列";
        case 13:return "第三警戒航行序列";
        case 14:return "第四警戒航行序列";
        default:return "不明(" + f + ")";
    }
}

function toMatch(id){
    switch (id) {
        case  1:return "同航戦";
        case  2:return "反航戦";
        case  3:return "Ｔ字有利";
        case  4:return "Ｔ字不利";
        default:return "不明(" + id + ")";
    }
}

function getEnemyDataList(data){
    var enemys = new ArrayList();
    for(var i = 1;i <= 6;i++){
        var id    = data.api_ship_ke[i].intValue();
        var name  = Ship.get(data.api_ship_ke[i].intValue()).getFullName();
        var lv    = data.api_ship_lv[i].intValue();
        var slots = parseIntArray(data.api_eSlot[i - 1]);
        var nowhp = data.api_nowhps[i + 6].intValue();
        var maxhp = data.api_maxhps[i + 6].intValue();
        enemys.add({id:id,name:name,lv:lv,slots:slots,nowhp:nowhp,maxhp:maxhp});
    }
    return enemys;
}

function toLostKindString(kind){
    switch(kind){
        case 1:return "空襲により備蓄資源に損害を受けました！";
        case 2:return "空襲により備蓄資源に損害を受け、基地航空隊にも地上撃破の損害が発生しました！";
        case 3:return "空襲により基地航空隊に地上撃破の損害が発生しました！";
        case 4:return "空襲による基地の損害はありません。";
        default:return "不明(" + kind + ")";
    }
}

function toLostKindShortString(kind){
    switch(kind){
        case 1:return "資源損害";
        case 2:return "資源・航空";
        case 3:return "航空隊損害";
        case 4:return "損害なし";
        default:return "不明(" + kind + ")";
    }
}

function toSeiku(id){
    switch(id){
        case 0:return "制空均衡";
        case 1:return "制空権確保";
        case 2:return "航空優勢";
        case 3:return "航空劣勢";
        case 4:return "制空権喪失";
        default:return "不明(" + kind + ")";
    }
}

function toTouchPlaneString(touchPlane) {
    if (touchPlane == null) {
        return ["",""];
    }
    var ret = [];
    for (var i = 0; i < 2; ++i) {
        if (touchPlane[i] == -1) {
            ret[i] = "なし";
        }
        else {
            var item = Item.get(touchPlane[i]);
            if (item != null) {
                ret[i] = item.getName();
            }
            else {
                ret[i] = "あり（機体不明）";
            }
        }
    }
    return ret;
}

function parseIntArray(array){
    return array.stream().map(function(data){
        return data.intValue();
    }).toArray();
}

function getNextKind(eventId,eventKind){
    switch (eventId) {
        case 2:return "資源獲得";
        case 3:return "渦潮";
        case 4:return "戦闘";
        case 5:return "ボス";
        case 6:{
            switch (eventKind) {
                case 1:return "敵影を見ず";
                case 2:return "能動分岐";
            }
            return "気のせい";
        }
        case 7:{
            if (eventKind == 0) {
                return "航空偵察";
            }
            return "航空戦";
        }
        case 8:return "船団護衛成功";
        case 9:return "揚陸地点";
        default:return null;
    }
}
