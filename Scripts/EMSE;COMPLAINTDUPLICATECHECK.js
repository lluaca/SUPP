iRec = null;
recordArray = new Array();
recordArray = capIdsGetByAddr();
aa.print("Length: " + recordArray.length);
if(recordArray.length > 0) {
for(iRec in recordArray)
include("EMSE:ComplaintDuplicateCheckLoop");
}