/* 

Developed by Mike Zachry on 5/14/2019 

This event script:
1) sets the Department parent record to "CAP Required" when a deficiency is found
2) adds a row to the Corrective Action Plan ASIT on the parent Department record for each deficiency on the Departmental Fire Drill record type amendment.


*/


 // var myCapId = "DF0000043";
 // var myUserId = "ADMIN";

/* ASA  */  //var eventName = "ApplicationSubmitAfter";
/* WTUA */  //var eventName = "WorkflowTaskUpdateAfter";  wfTask = "Application Submittal";	  wfStatus = "Admin Approved";  wfDateMMDDYYYY = "01/27/2015";
/* IRSA */  //var eventName = "InspectionResultSubmitAfter" ; inspResult = "Failed"; inspResultComment = "Comment";  inspType = "Roofing"
/* ISA  */  //var eventName = "InspectionScheduleAfter" ; inspType = "Roofing"
/* PRA  */  //var eventName = "PaymentReceiveAfter";  
/* CRCA */  //var eventName = "ConvertToRealCAPAfter";

// var useProductScript = false;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
// var runEvent = true; // set to true to simulate the event and run all std choices/scripts for the record type.  

/* master script code don't touch */ 
// aa.env.setValue("EventName",eventName); var vEventName = eventName;  var controlString = eventName;  var tmpID = aa.cap.getCapID(myCapId).getOutput(); if(tmpID != null){aa.env.setValue("PermitId1",tmpID.getID1()); 	aa.env.setValue("PermitId2",tmpID.getID2()); 	aa.env.setValue("PermitId3",tmpID.getID3());} aa.env.setValue("CurrentUserID",myUserId); var preExecute = "PreExecuteForAfterEvents";var documentOnly = false;var SCRIPT_VERSION = 3.0;var useSA = false;var SA = null;var SAScript = null;var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 	useSA = true; 		SA = bzr.getOutput().getDescription();	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 	if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }	}if (SA) {	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,useProductScript));	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA,useProductScript));	/* force for script test*/ showDebug = true; eval(getScriptText(SAScript,SA,useProductScript));	}else {	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript));	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useProductScript));	}	eval(getScriptText("INCLUDES_CUSTOM",null,useProductScript));if (documentOnly) {	doStandardChoiceActions2(controlString,false,0);	aa.env.setValue("ScriptReturnCode", "0");	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");	aa.abortScript();	}var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";var doStdChoices = true;  var doScripts = false;var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;if (bzr) {	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");	doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");	doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";	}	function getScriptText(vScriptName, servProvCode, useProductScripts) {	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();	vScriptName = vScriptName.toUpperCase();	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();	try {		if (useProductScripts) {			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);		} else {			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");		}		return emseScript.getScriptText() + "";	} catch (err) {		return "";	}}logGlobals(AInfo); if (runEvent && typeof(doStandardChoiceActions) == "function" && doStdChoices) try {doStandardChoiceActions(controlString,true,0); } catch (err) { logDebug(err.message) } if (runEvent && typeof(doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g,"\r");  aa.print(z); 

//
// User code goes here
//

try {
	showDebug = true;
  var outOfCompliance = false;
  var parentCapId = getParentByCapId(capId);
  var parentCap = aa.cap.getCap(parentCapId).getOutput();
  // logDebug("calling myCopy");
  // var myResult = copy();
  // logDebug(parentCap.specialText);
  // editAppName(parentCap.specialText, capId)
  // logDebug(cap.specialText);

/*
  // read through the ASI fields looking for value of "Out of Compliance" 
  for (var x in AInfo) {
    
    // if out of compliance
    if (AInfo[x] == "Out of Compliance") {
      outOfCompliance = true;
      
      // add row to Corrective Action Plan ASIT on parent
      rowVals = new Array();
      rowVals["Inspection Date"] = new asiTableValObj("Inspection Date",AInfo["Drill Date"],"N");
      rowVals["Inspected By"] = new asiTableValObj("Inspected By",AInfo["Person Observing"],"N");

      parentCap = aa.cap.getCap(parentCapId).getOutput();
      rowVals["Department"] = new asiTableValObj("Department",parentCap.specialText,"N");
      rowVals["Department ID #"] = new asiTableValObj("Department ID #",parentCapId.customID,"N");
      rowVals["Description"] = new asiTableValObj("Description","Fire Drill","N");
      rowVals["Deficiency"] = new asiTableValObj("Deficiency",x,"N");
      rowVals["Vio. Status"] = new asiTableValObj("Vio. Status",AInfo[x],"N");
      // rowVals["Inspector Comment"] = new asiTableValObj("Inspector Comment", " ","N");
      // rowVals["CAP Review Comment"] = new asiTableValObj("CAP Review Comment"," ","N");
      rowVals["Corrective Action"] = new asiTableValObj("Corrective Action","Enter corrective action","N");
      rowVals["Responsible Party"] = "Enter reponsible party";
      // rowVals["Responsible Party"] = new asiTableValObj("Responsible Party"," ","N");
      rowVals["Inspection Type"] = new asiTableValObj("Program","Fire Drill","N");
      rowVals["CAP Status"] = new asiTableValObj("CAP Status","Incomplete","N");
      rowVals["Actual/Planned Correction Date"] = new asiTableValObj("Actual/Planned Correction Date","01/01/2000","N");
      var addrResult = aa.address.getAddressByCapId(parentCapId);
      if (addrResult) {
        var addrArray = new Array();
        var addrArray = addrResult.getOutput();
        var streetName = addrArray[0].getStreetName();
        var hseNum = addrArray[0].getHouseNumberStart();
        var streetSuffix = addrArray[0].getStreetSuffix();
        var streetDir = addrArray[0].getStreetDirection();
        var unitType = addrArray[0].getUnitType();
        var unitNbr = addrArray[0].getUnitStart();
      }

      if (addrResult && streetDir != null) {
        var vAddress = hseNum + " "  + streetDir  + " "   + streetName;
      } else {
        var vAddress = hseNum + " "   + streetName;
      }

      if (addrResult && streetSuffix != null) {
        vAddress = vAddress + " " + streetSuffix;
      }

      if (addrResult && unitType != null) {
        vAddress = vAddress + " " + unitType;
      }

      if (addrResult && unitNbr != null) {
        vAddress = vAddress + " " + unitNbr;
      }

      if (vAddress) {
        rowVals["Address"] = new asiTableValObj("Address", vAddress,"N");
      } else {
        rowVals["Address"] = new asiTableValObj("Address", "","N");
      }

      logDebug("Updating ASIT");
      addToASITable("CAP", rowVals, parentCapId);
    }
  }
  // set the parent record to "CAP Required"
  if (outOfCompliance) {
    updateAppStatus("CAP Required","Updated by EMSE Script",parentCapId);
  }
*/
  // send email notification to contacts
  // Provide the ACA URl - This should be set in INCLUDES_CUSTOM_GLOBALS
  // var acaURL = "aca.supp.accela.com/LLU"
  // Provide the Agency Reply Email - This should be set in INCLUDES_CUSTOM_GLOBALS
  var agencyReplyEmail = "noreply@accela.com"
  // Provide the contact types to send this notification
  var contactTypesArray = new Array("Primary");
  contactTypesArray[1] = "Frontline Leadership";
  contactTypesArray[2] = "Contact";
  contactTypesArray[3] = "Executive Leadership";
  // Provide the Notification Template to use
  var notificationTemplate = "LLU FIRE DRILL NOTIFICATION";
  // Get an array of Contact Objects using Master Scripts 3.0
  var contactObjArray = getContactObjs(capId,contactTypesArray);


  for (iCon in contactObjArray) 
  {
    var tContactObj = contactObjArray[iCon];
    logDebug("ContactName: " + tContactObj.people.getFirstName() + " " + tContactObj.people.getLastName());
    if (!matches(tContactObj.people.getEmail(),null,undefined,"")) 
    { 
      // logDebug("Contact Email: " + tContactObj.people.getEmail());
      var eParams = aa.util.newHashtable();
      addParameter(eParams, "$$recordTypeAlias$$", cap.getCapType().getAlias());
      addParameter(eParams, "$$acaUrl$$", acaURL);
      // addParameter(eParams, "$$recordTypeAlias$$", "Department");
      // myGetRecordParams4Notification(eParams,capId);
      getRecordParams4Notification(eParams);
      // myGetACARecordParam4Notification(eParams,acaURL,capId);
      getACARecordParam4Notification(eParams,acaURL);
      // logDebug(capId);
      tContactObj.getEmailTemplateParams(eParams);
      // not needed getWorkflowParams4Notification(eParams); 
      // not needed getInspectionResultParams4Notification(eParams);
      getPrimaryAddressLineParam4Notification(eParams);
      // Call sendNotification if you are not using a report
      logDebug(capId);
      logDebug(getACARecordURL(acaURL));
      sendNotification(agencyReplyEmail,tContactObj.people.getEmail(),"",notificationTemplate ,eParams,null);
    }
  }
} catch (err) {
	logDebug("A JavaScript Error occured: " + err.message);
}
// end user code
// aa.env.setValue("ScriptReturnCode", "1"); 	
// aa.env.setValue("ScriptReturnMessage", debug)

/*------------------------------------------------------------------------------------------------------/
| <===========Functions (used by copy)
/------------------------------------------------------------------------------------------------------*/


function copy()
{
  logDebug("Starting copy");
    //----------------------------------------
    var capModel = aa.cap.getCap(capId).getOutput();
    // logDebug(capModel);
    // var capModel = cap;
		
    targetCapId = capModel.getCapID();
   
    logDebug("Debug:","TargetCapId:" + targetCapId);

    if(targetCapId==null)
    {
      var errorMessage = "targetCapId is null.";
      logDebug(errorMessage);
      errorCode=-1;
      end();
      return;
    }
	
	//var parentCapId = capModel.getParentCapID();
    var parentCapId = getParent(targetCapId);
	
	logDebug("Debug","Parent:" + parentCapId);

    if(parentCapId==null)
    {
      errorMessage+="Parent is null.";
      errorCode=-1;
      end();
      return;
    }
	
    try
    {  
		// copyAppSpecificTable(parentCapId, targetCapId);
      
		// copyAppSpecificInfo(parentCapId, targetCapId);
      
		// copyLicenseProfessional(parentCapId, targetCapId);
      
		copyAddress(parentCapId, targetCapId);

		// copyParcel(parentCapId, targetCapId);
      
		copyPeople(parentCapId, targetCapId);
      
		// copyOwner(parentCapId, targetCapId);
      
		// copyCapCondition(parentCapId, targetCapId);
      
		// copyAdditionalInfo(parentCapId, targetCapId);
      
		// copyCapDetailInfo(parentCapId, targetCapId);
      
		// copyCapWorkDesInfo(parentCapId, targetCapId);
	  
		var amendCapModel = aa.cap.getCapViewBySingle4ACA(targetCapId);
      		amendCapModel.getCapType().setSpecInfoCode(capModel.getCapType().getSpecInfoCode()); 

		aa.env.setValue("CapModel", amendCapModel);
      
		aa.env.setValue("CAP_MODEL_INITED", "TRUE");       
    }
    catch(e)
    { 
		logError("Error: "+e); 
		end();
    }
}
function copyCapWorkDesInfo(srcCapId, targetCapId)
{
    aa.cap.copyCapWorkDesInfo(srcCapId, targetCapId);
}

function copyCapDetailInfo(srcCapId, targetCapId)
{
    aa.cap.copyCapDetailInfo(srcCapId, targetCapId);
}
 

function copyAppSpecificTable(srcCapId, targetCapId)
{
  var tableNameArray = getTableName(srcCapId);
  if (tableNameArray == null)
  {
    return;
  }
  for (loopk in tableNameArray)
  {
    var tableName = tableNameArray[loopk];
	
	//if (!matches(tableName,"OFFICER/OWNERSHIP INFORMATION","SIGNING AUTHORITY","POWER OF ATTORNEY INFORMATION","TRADE NAMES / OPERATING NAME"))
		//continue;

	var targetAppSpecificTable = loadASITable(tableName,srcCapId);
		addASITable(tableName, targetAppSpecificTable,targetCapId);
  }
}

function getTableName(capId)
{
  var tableName = null;
  var result = aa.appSpecificTableScript.getAppSpecificGroupTableNames(capId);
  if(result.getSuccess())
  {
    tableName = result.getOutput();
    if(tableName!=null)
    {
      return tableName;
    }
  }
  return tableName;
}

function getAppSpecificTable(capId,tableName)
{
  appSpecificTable = null;
  var s_result = aa.appSpecificTableScript.getAppSpecificTableModel(capId,tableName);
  if(s_result.getSuccess())
  {
    appSpecificTable = s_result.getOutput();
    if (appSpecificTable == null || appSpecificTable.length == 0)
    {
      aa.print("WARNING: no appSpecificTable on this CAP:" + capId);
      appSpecificTable = null;
    }
  }
  else
  {
    appSpecificTable = null;  
  }
  return appSpecificTable;
}


function logError(error)
{
    aa.print(error);
 
    errorMessage += error + br;
 
    errorCode = -1;
}
 
function end()
{
    aa.env.setValue("ErrorCode", errorCode);
 
    aa.env.setValue("ErrorMessage", errorMessage);
}
function getParent(targetCapId) 
{
	// returns the capId object of the parent.  Assumes only one parent!
	//
	var getCapResult = aa.cap.getProjectParents(targetCapId,1);
	if (getCapResult.getSuccess())
	{
		var parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else
			{
			aa.print("**WARNING: GetParent found no project parent for this application");
			return false;
			}
	}
	else
	{ 
		aa.print("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
	}
}
function matches(eVal,argList) 
{
   for (var i=1; i<arguments.length;i++)
   	if (arguments[i] == eVal)
   		return true;
}
function loadASITable(tname) 
{
	itemCap = arguments[1]; // use cap ID specified in args

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
	var tai = ta.iterator();

	while (tai.hasNext())
	{
	  var tsm = tai.next();
	  var tn = tsm.getTableName();

      if (!tn.equals(tname)) continue;

	  if (tsm.rowIndex.isEmpty())
	  	{
			aa.print("Couldn't load ASI Table " + tname + " it is empty");
			return false;
		}

   	  var tempObject = new Array();
	  var tempArray = new Array();

  	  var tsmfldi = tsm.getTableField().iterator();
	  var tsmcoli = tsm.getColumns().iterator();
      var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
	  var numrows = 1;

	  while (tsmfldi.hasNext())  // cycle through fields
		{
		if (!tsmcoli.hasNext())  // cycle through columns
			{
			var tsmcoli = tsm.getColumns().iterator();
			tempArray.push(tempObject);  // end of record
			var tempObject = new Array();  // clear the temp obj
			numrows++;
			}
		var tcol = tsmcoli.next();
		var tval = tsmfldi.next();
		var readOnly = 'N';
		if (readOnlyi.hasNext()) {
			readOnly = readOnlyi.next();
		}
		var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
		tempObject[tcol.getColumnName()] = fieldInfo;
		}		
	  tempArray.push(tempObject);  // end of record
	}	
	return tempArray;
}

function asiTableValObj(columnName, fieldValue, readOnly) {
	this.columnName = columnName;
	this.fieldValue = fieldValue;
	this.readOnly = readOnly;

	asiTableValObj.prototype.toString=function(){ return this.fieldValue }
};
	
function addASITable(tableName,tableValueArray) // optional capId
{
  	//  tableName is the name of the ASI table
  	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
  	if (arguments.length > 2)
  		itemCap = arguments[2]; // use cap ID specified in args
  
  	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap,tableName)
  
  	if (!tssmResult.getSuccess())
  		{ aa.print("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }
  
  	var tssm = tssmResult.getOutput();
  	var tsm = tssm.getAppSpecificTableModel();
  	var fld = tsm.getTableField();
    var fld_readonly = tsm.getReadonlyField(); // get Readonly field
  
    for (thisrow in tableValueArray)
	{
  
  		var col = tsm.getColumns()
  		var coli = col.iterator();
  
  		while (coli.hasNext())
  		{
  			var colname = coli.next();
  
			if (typeof(tableValueArray[thisrow][colname.getColumnName()]) == "object")  // we are passed an asiTablVal Obj

				{
	  			fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
	  			fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
				}
			else // we are passed a string
				{
  				fld.add(tableValueArray[thisrow][colname.getColumnName()]);
  				fld_readonly.add(null);
				}
  		}
  
  		tsm.setTableField(fld);
  
  		tsm.setReadonlyField(fld_readonly);
  
  	}
  
  	var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
  
  	 if (!addResult .getSuccess())
  		{ aa.print("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()) ; return false }
  	else
		{
			//Refresh Cap Model (Custom Addition by Engineering, but wasn't able to submit ACA record)
			//var tmpCap = aa.cap.getCapViewBySingle(capId);
			//cap.setAppSpecificTableGroupModel(tmpCap.getAppSpecificTableGroupModel()); 

			aa.print("Successfully added record to ASI Table: " + tableName);
		}
  
}

function copyAppSpecificInfo(srcCapId, targetCapId)
{
    //1. Get Application Specific Information with source CAPID.
    var  appSpecificInfo = getAppSpecificInfo(srcCapId);
    if (appSpecificInfo == null || appSpecificInfo.length == 0)
    {
      return;
    }
    //2. Set target CAPID to source Specific Information.
    for (loopk in appSpecificInfo)
    {
      var sourceAppSpecificInfoModel = appSpecificInfo[loopk];
      
      sourceAppSpecificInfoModel.setPermitID1(targetCapId.getID1());
      sourceAppSpecificInfoModel.setPermitID2(targetCapId.getID2());
      sourceAppSpecificInfoModel.setPermitID3(targetCapId.getID3());  
      //3. Edit ASI on target CAP (Copy info from source to target)
      aa.appSpecificInfo.editAppSpecInfoValue(sourceAppSpecificInfoModel);
    }
}
function getAppSpecificInfo(capId)
{
    capAppSpecificInfo = null;
    var s_result = aa.appSpecificInfo.getByCapID(capId);
    if(s_result.getSuccess())
    {
      capAppSpecificInfo = s_result.getOutput();
      if (capAppSpecificInfo == null || capAppSpecificInfo.length == 0)
      {
        aa.print("WARNING: no appSpecificInfo on this CAP:" + capId);
        capAppSpecificInfo = null;
      }
    }
    else
    {
      aa.print("ERROR: Failed to appSpecificInfo: " + s_result.getErrorMessage());
      capAppSpecificInfo = null;  
    }
    // Return AppSpecificInfoModel[] 
    return capAppSpecificInfo;
}

function checkKeyFile(capId)
{
    var sEIN;

    //get the EIN from parent cap
    var contactType = "Business Headquarters";
    var capContactResult = aa.people.getCapContactByCapID(capId);

    if (capContactResult.getSuccess()) 
	    var capContactArray = capContactResult.getOutput();
    
    if (capContactArray) 
	{
        for (yy in capContactArray) 
		{
            //aa.print("getContactType:" + capContactArray[yy].getCapContactModel().getContactType());
            if (capContactArray[yy].getCapContactModel().getContactType() == contactType) {
                sEIN = capContactArray[yy].getPeople().getFein();
                aa.print("EIN:" + sEIN);
            }
        }
    }

    //get the caps with same EIN
    capId = aa.cap.createCapIDScriptModel(null, null, null).getCapID();
    newPeople = aa.people.createPeopleModel().getOutput().getPeopleModel();
    newPeople.setServiceProviderCode(aa.getServiceProviderCode());
    newPeople.setFein(sEIN);   // FEIN to search for 75-30712343, "75-30712345"
    result = aa.people.getCapContactByRefPeopleModel(capId, newPeople); //.getOutput()


    capArray = result.getOutput();

    aa.print("capArray.Length:" + capArray.length);
    //loop thru if any record found
    if (capArray.length > 0) 
	{
        for (y in capArray)
		{  
            var arrCapIDs = capArray[y].getCapID().toString().split("-");

            capId = aa.cap.getCapID(arrCapIDs[0], arrCapIDs[1], arrCapIDs[2]).getOutput();
            logError("***********************");
            aa.print("capId.getCustomID:" + capId.getCustomID());
            aa.print("Key File Indicator: " + getAppSpecific("Key File Indicator: ", capId));

            if (getAppSpecific("Key File Indicator", capId) == "CHECKED") 
			{
                kfTrNum = getAppSpecific("Key File Tracking Number", capId);              
                return kfTrNum;
            }
        }

    } 
	else 
		return null;
}

function getAppSpecific(itemName)  // optional: itemCap
{
	var updated = false;
	var i=0;
	var itemCap = arguments[1]; // use cap ID specified in args
   	
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		
		if (itemName != "")
		{
			for (i in appspecObj)
				if( appspecObj[i].getCheckboxDesc() == itemName)
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
		} // item name blank
	} 
	else
		{ aa.print( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
}

function copyLicenseProfessional(srcCapId, targetCapId)
{
    //1. Get license professionals with source CAPID.
    var capLicenses = getLicenseProfessional(srcCapId);
    if (capLicenses == null || capLicenses.length == 0)
    {
      return;
    }
    //2. Get license professionals with target CAPID.
    var targetLicenses = getLicenseProfessional(targetCapId);
    //3. Check to see which licProf is matched in both source and target.
    for (loopk in capLicenses)
    {
      sourcelicProfModel = capLicenses[loopk];
      //3.1 Set target CAPID to source lic prof.
      sourcelicProfModel.setCapID(targetCapId);
      targetLicProfModel = null;
      //3.2 Check to see if sourceLicProf exist.
      if (targetLicenses != null && targetLicenses.length > 0)
      {
        for (loop2 in targetLicenses)
        {
          if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2]))
          {
            targetLicProfModel = targetLicenses[loop2];
            break;
          }
        }
      }
      //3.3 It is a matched licProf model.
      if (targetLicProfModel != null)
      {
        //3.3.1 Copy information from source to target.
        aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
        //3.3.2 Edit licProf with source licProf information. 
        aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
      }
      //3.4 It is new licProf model.
      else
      {
        //3.4.1 Create new license professional.
        aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
      }
    }
}

function isMatchLicenseProfessional(licProfScriptModel1, licProfScriptModel2)
{
    if (licProfScriptModel1 == null || licProfScriptModel2 == null)
    {
      return false;
    }
    if (licProfScriptModel1.getLicenseType().equals(licProfScriptModel2.getLicenseType())
      && licProfScriptModel1.getLicenseNbr().equals(licProfScriptModel2.getLicenseNbr()))
    {
      return true;
    }
    return  false;
}

function getLicenseProfessional(capId)
{
    capLicenseArr = null;
    var s_result = aa.licenseProfessional.getLicenseProf(capId);
    if(s_result.getSuccess())
    {
      capLicenseArr = s_result.getOutput();
      if (capLicenseArr == null || capLicenseArr.length == 0)
      {
        aa.print("WARNING: no licensed professionals on this CAP:" + capId);
        capLicenseArr = null;
      }
    }
    else
    {
      aa.print("ERROR: Failed to license professional: " + s_result.getErrorMessage());
      capLicenseArr = null; 
    }
    return capLicenseArr;
}


function copyAddress(srcCapId, targetCapId)
{
    //1. Get address with source CAPID.
    var capAddresses = getAddress(srcCapId);
    if (capAddresses == null || capAddresses.length == 0)
    {
      return;
    }
    //2. Get addresses with target CAPID.
    var targetAddresses = getAddress(targetCapId);
    //3. Check to see which address is matched in both source and target.
    for (loopk in capAddresses)
    {
      sourceAddressfModel = capAddresses[loopk];
      //3.1 Set target CAPID to source address.
      sourceAddressfModel.setCapID(targetCapId);
      targetAddressfModel = null;
      //3.2 Check to see if sourceAddress exist.
      if (targetAddresses != null && targetAddresses.length > 0)
      {
        for (loop2 in targetAddresses)
        {
          if (isMatchAddress(sourceAddressfModel, targetAddresses[loop2]))
          {
            targetAddressfModel = targetAddresses[loop2];
            break;
          }
        }
      }
      //3.3 It is a matched address model.
      if (targetAddressfModel != null)
      {
        //3.3.1 Copy information from source to target.
        aa.address.copyAddressModel(sourceAddressfModel, targetAddressfModel);
        //3.3.2 Edit address with source address information. 
        aa.address.editAddressWithAPOAttribute(targetCapId, targetAddressfModel);
      }
      //3.4 It is new address model.
      else
      { 
        //3.4.1 Create new address.
        aa.address.createAddressWithAPOAttribute(targetCapId, sourceAddressfModel);
      }
    }
}

function isMatchAddress(addressScriptModel1, addressScriptModel2)
{
  if (addressScriptModel1 == null || addressScriptModel2 == null)
  {
    return false;
  }
  var streetName1 = addressScriptModel1.getStreetName();
  var streetName2 = addressScriptModel2.getStreetName();
  if ((streetName1 == null && streetName2 != null) 
    || (streetName1 != null && streetName2 == null))
  {
    return false;
  }
  if (streetName1 != null && !streetName1.equals(streetName2))
  {
    return false;
  }
  return true;
}

function getAddress(capId)
{
  capAddresses = null;
  var s_result = aa.address.getAddressByCapId(capId);
  if(s_result.getSuccess())
  {
    capAddresses = s_result.getOutput();
    if (capAddresses == null || capAddresses.length == 0)
    {
      aa.print("WARNING: no addresses on this CAP:" + capId);
      capAddresses = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to address: " + s_result.getErrorMessage());
    capAddresses = null;  
  }
  return capAddresses;
}

function copyParcel(srcCapId, targetCapId)
{
  //1. Get parcels with source CAPID.
  var copyParcels = getParcel(srcCapId);
  if (copyParcels == null || copyParcels.length == 0)
  {
    return;
  }
  //2. Get parcel with target CAPID.
  var targetParcels = getParcel(targetCapId);
  //3. Check to see which parcel is matched in both source and target.
  for (i = 0; i < copyParcels.size(); i++)
  {
    sourceParcelModel = copyParcels.get(i);
    //3.1 Set target CAPID to source parcel.
    sourceParcelModel.setCapID(targetCapId);
    targetParcelModel = null;
    //3.2 Check to see if sourceParcel exist.
    if (targetParcels != null && targetParcels.size() > 0)
    {
      for (j = 0; j < targetParcels.size(); j++)
      {
        if (isMatchParcel(sourceParcelModel, targetParcels.get(j)))
        {
          targetParcelModel = targetParcels.get(j);
          break;
        }
      }
    }
    //3.3 It is a matched parcel model.
    if (targetParcelModel != null)
    {
      //3.3.1 Copy information from source to target.
      var tempCapSourceParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, 

      sourceParcelModel).getOutput();
      var tempCapTargetParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, 

      targetParcelModel).getOutput();
      aa.parcel.copyCapParcelModel(tempCapSourceParcel, tempCapTargetParcel);
      //3.3.2 Edit parcel with sourceparcel. 
      aa.parcel.updateDailyParcelWithAPOAttribute(tempCapTargetParcel);
    }
    //3.4 It is new parcel model.
    else
    {
      //3.4.1 Create new parcel.
      aa.parcel.createCapParcelWithAPOAttribute(aa.parcel.warpCapIdParcelModel2CapParcelModel

      (targetCapId, sourceParcelModel).getOutput());
    }
  }
}

function isMatchParcel(parcelScriptModel1, parcelScriptModel2)
{
  if (parcelScriptModel1 == null || parcelScriptModel2 == null)
  {
    return false;
  }
  if (parcelScriptModel1.getParcelNumber().equals(parcelScriptModel2.getParcelNumber()))
  {
    return true;
  }
  return  false;
}

function getParcel(capId)
{
  capParcelArr = null;
  var s_result = aa.parcel.getParcelandAttribute(capId, null);
  if(s_result.getSuccess())
  {
    capParcelArr = s_result.getOutput();
    if (capParcelArr == null || capParcelArr.length == 0)
    {
      aa.print("WARNING: no parcel on this CAP:" + capId);
      capParcelArr = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to parcel: " + s_result.getErrorMessage());
    capParcelArr = null;  
  }
  return capParcelArr;
}

function copyPeople(srcCapId, targetCapId)
{
  //1. Get people with source CAPID.
  var capPeoples = getPeople(srcCapId);
  aa.print("Source Cap ID:" + srcCapId);

  if (capPeoples == null || capPeoples.length == 0)
  {
    aa.print("Didn't get the source peoples!");
    return;
  }
  //2. Get people with target CAPID.
  var targetPeople = getPeople(targetCapId);
  //3. Check to see which people is matched in both source and target.
  for (loopk in capPeoples)
  {
    sourcePeopleModel = capPeoples[loopk];
    //3.1 Set target CAPID to source people.
    sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
    
    targetPeopleModel = null;
    //3.2 Check to see if sourcePeople exist.
    if (targetPeople != null && targetPeople.length > 0)
    {
      for (loop2 in targetPeople)
      {
        if (isMatchPeople(sourcePeopleModel, targetPeople[loop2]))
        {
          targetPeopleModel = targetPeople[loop2];
          break;
        }
      }
    }
    //3.3 It is a matched people model.
    if (targetPeopleModel != null)
    {
      //3.3.1 Copy information from source to target.
      aa.people.copyCapContactModel(sourcePeopleModel.getCapContactModel(), targetPeopleModel.getCapContactModel());
      //3.3.2 Edit People with source People information. 
      aa.people.editCapContactWithAttribute(targetPeopleModel.getCapContactModel());
    }
    //3.4 It is new People model.
    else
    {
      //3.4.1 Create new people.
      aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
    }
  }
}

function isMatchPeople(capContactScriptModel, capContactScriptModel2)
{
  if (capContactScriptModel == null || capContactScriptModel2 == null)
  {
    return false;
  }
  var contactType1 = capContactScriptModel.getCapContactModel().getPeople().getContactType();
  var contactType2 = capContactScriptModel2.getCapContactModel().getPeople().getContactType();
  var firstName1 = capContactScriptModel.getCapContactModel().getPeople().getFirstName();
  var firstName2 = capContactScriptModel2.getCapContactModel().getPeople().getFirstName();
  var lastName1 = capContactScriptModel.getCapContactModel().getPeople().getLastName();
  var lastName2 = capContactScriptModel2.getCapContactModel().getPeople().getLastName();
  var fullName1 = capContactScriptModel.getCapContactModel().getPeople().getFullName();
  var fullName2 = capContactScriptModel2.getCapContactModel().getPeople().getFullName();
  if ((contactType1 == null && contactType2 != null) 
    || (contactType1 != null && contactType2 == null))
  {
    return false;
  }
  if (contactType1 != null && !contactType1.equals(contactType2))
  {
    return false;
  }
  if ((firstName1 == null && firstName2 != null) 
    || (firstName1 != null && firstName2 == null))
  {
    return false;
  }
  if (firstName1 != null && !firstName1.equals(firstName2))
  {
    return false;
  }
  if ((lastName1 == null && lastName2 != null) 
    || (lastName1 != null && lastName2 == null))
  {
    return false;
  }
  if (lastName1 != null && !lastName1.equals(lastName2))
  {
    return false;
  }
  if ((fullName1 == null && fullName2 != null) 
    || (fullName1 != null && fullName2 == null))
  {
    return false;
  }
  if (fullName1 != null && !fullName1.equals(fullName2))
  {
    return false;
  }
  return  true;
}

function getPeople(capId)
{
  capPeopleArr = null;
  var s_result = aa.people.getCapContactByCapID(capId);
  if(s_result.getSuccess())
  {
    capPeopleArr = s_result.getOutput();
    if (capPeopleArr == null || capPeopleArr.length == 0)
    {
      aa.print("WARNING: no People on this CAP:" + capId);
      capPeopleArr = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to People: " + s_result.getErrorMessage());
    capPeopleArr = null;  
  }
  return capPeopleArr;
}

function copyOwner(srcCapId, targetCapId)
{
  //1. Get Owners with source CAPID.
  var capOwners = getOwner(srcCapId);
  if (capOwners == null || capOwners.length == 0)
  {
    return;
  }
  //2. Get Owners with target CAPID.
  var targetOwners = getOwner(targetCapId);
  //3. Check to see which owner is matched in both source and target.
  for (loopk in capOwners)
  {
    sourceOwnerModel = capOwners[loopk];
    //3.1 Set target CAPID to source Owner.
    sourceOwnerModel.setCapID(targetCapId);
    targetOwnerModel = null;
    //3.2 Check to see if sourceOwner exist.
    if (targetOwners != null && targetOwners.length > 0)
    {
      for (loop2 in targetOwners)
      {
        if (isMatchOwner(sourceOwnerModel, targetOwners[loop2]))
        {
          targetOwnerModel = targetOwners[loop2];
          break;
        }
      }
    }
    //3.3 It is a matched owner model.
    if (targetOwnerModel != null)
    {
      //3.3.1 Copy information from source to target.
      aa.owner.copyCapOwnerModel(sourceOwnerModel, targetOwnerModel);
      //3.3.2 Edit owner with source owner information. 
      aa.owner.updateDailyOwnerWithAPOAttribute(targetOwnerModel);
    }
    //3.4 It is new owner model.
    else
    {
      //3.4.1 Create new Owner.
      aa.owner.createCapOwnerWithAPOAttribute(sourceOwnerModel);
    }
  }
}

function isMatchOwner(ownerScriptModel1, ownerScriptModel2)
{
  if (ownerScriptModel1 == null || ownerScriptModel2 == null)
  {
    return false;
  }
  var fullName1 = ownerScriptModel1.getOwnerFullName();
  var fullName2 = ownerScriptModel2.getOwnerFullName();
  if ((fullName1 == null && fullName2 != null) 
    || (fullName1 != null && fullName2 == null))
  {
    return false;
  }
  if (fullName1 != null && !fullName1.equals(fullName2))
  {
    return false;
  }
  return  true;
}

function getOwner(capId)
{
  capOwnerArr = null;
  var s_result = aa.owner.getOwnerByCapId(capId);
  if(s_result.getSuccess())
  {
    capOwnerArr = s_result.getOutput();
    if (capOwnerArr == null || capOwnerArr.length == 0)
    {
      aa.print("WARNING: no Owner on this CAP:" + capId);
      capOwnerArr = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to Owner: " + s_result.getErrorMessage());
    capOwnerArr = null; 
  }
  return capOwnerArr;
}

function copyCapCondition(srcCapId, targetCapId)
{
  //1. Get Cap condition with source CAPID.
  var capConditions = getCapConditionByCapID(srcCapId);
  if (capConditions == null || capConditions.length == 0)
  {
    return;
  }
  //2. Get Cap condition with target CAPID.
  var targetCapConditions = getCapConditionByCapID(targetCapId);
  //3. Check to see which Cap condition is matched in both source and target.
  for (loopk in capConditions)
  {
    sourceCapCondition = capConditions[loopk];
    //3.1 Set target CAPID to source Cap condition.
    sourceCapCondition.setCapID(targetCapId);
    targetCapCondition = null;
    //3.2 Check to see if source Cap condition exist in target CAP. 
    if (targetCapConditions != null && targetCapConditions.length > 0)
    {
      for (loop2 in targetCapConditions)
      {
        if (isMatchCapCondition(sourcelicProfModel, targetCapConditions[loop2]))
        {
          targetCapCondition = targetCapConditions[loop2];
          break;
        }
      }
    }
    //3.3 It is a matched Cap condition model.
    if (targetCapCondition != null)
    {
      //3.3.1 Copy information from source to target.
      sourceCapCondition.setConditionNumber(targetCapCondition.getConditionNumber());
      //3.3.2 Edit Cap condition with source Cap condition information. 
      aa.capCondition.editCapCondition(sourceCapCondition);
    }
    //3.4 It is new Cap condition model.
    else
    {
      //3.4.1 Create new Cap condition.
      aa.capCondition.createCapCondition(sourceCapCondition);
    }
  }
}

function isMatchCapCondition(capConditionScriptModel1, capConditionScriptModel2)
{
  if (capConditionScriptModel1 == null || capConditionScriptModel2 == null)
  {
    return false;
  }
  var description1 = capConditionScriptModel1.getConditionDescription();
  var description2 = capConditionScriptModel2.getStreetName();
  if ((description1 == null && description2 != null) 
    || (description1 != null && description2 == null))
  {
    return false;
  }
  if (description1 != null && !description1.equals(description2))
  {
    return false;
  }
  var conGroup1 = capConditionScriptModel1.getConditionGroup();
  var conGroup2 = capConditionScriptModel2.getConditionGroup();
  if ((conGroup1 == null && conGroup2 != null) 
    || (conGroup1 != null && conGroup2 == null))
  {
    return false;
  }
  if (conGroup1 != null && !conGroup1.equals(conGroup2))
  {
    return false;
  }
  return true;
}

function getCapConditionByCapID(capId)
{
  capConditionScriptModels = null;
  
  var s_result = aa.capCondition.getCapConditions(capId);
  if(s_result.getSuccess())
  {
    capConditionScriptModels = s_result.getOutput();
    if (capConditionScriptModels == null || capConditionScriptModels.length == 0)
    {
      aa.print("WARNING: no cap condition on this CAP:" + capId);
      capConditionScriptModels = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to get cap condition: " + s_result.getErrorMessage());
    capConditionScriptModels = null;  
  }
  return capConditionScriptModels;
}

function copyAdditionalInfo(srcCapId, targetCapId)
{
  //1. Get Additional Information with source CAPID.  (BValuatnScriptModel)
  var  additionalInfo = getAdditionalInfo(srcCapId);
  if (additionalInfo == null)
  {
    return;
  }
  //2. Get CAP detail with source CAPID.
  var  capDetail = getCapDetailByID(srcCapId);
  //3. Set target CAP ID to additional info.
  additionalInfo.setCapID(targetCapId);
  if (capDetail != null)
  {
    capDetail.setCapID(targetCapId);
  }
  //4. Edit or create additional infor for target CAP.
  aa.cap.editAddtInfo(capDetail, additionalInfo);
}

//Return BValuatnScriptModel for additional info.
function getAdditionalInfo(capId)
{
  bvaluatnScriptModel = null;
  var s_result = aa.cap.getBValuatn4AddtInfo(capId);
  if(s_result.getSuccess())
  {
    bvaluatnScriptModel = s_result.getOutput();
    if (bvaluatnScriptModel == null)
    {
      aa.print("WARNING: no additional info on this CAP:" + capId);
      bvaluatnScriptModel = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to get additional info: " + s_result.getErrorMessage());
    bvaluatnScriptModel = null; 
  }
  // Return bvaluatnScriptModel
  return bvaluatnScriptModel;
}

function getCapDetailByID(capId)
{
  capDetailScriptModel = null;
  var s_result = aa.cap.getCapDetail(capId);
  if(s_result.getSuccess())
  {
    capDetailScriptModel = s_result.getOutput();
    if (capDetailScriptModel == null)
    {
      aa.print("WARNING: no cap detail on this CAP:" + capId);
      capDetailScriptModel = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to get cap detail: " + s_result.getErrorMessage());
    capDetailScriptModel = null;  
  }
  // Return capDetailScriptModel
  return capDetailScriptModel;
}



 


