/*
programmer: Mike Zachry - Civic Good Software - 559-905-0006

2021/06/15 - The purpose of this ASIB event script is to copy the Department record CAP ASIT CAP Status row/field value 
to the CAP Status Before column to determine in the ASIA event if the of CAP Status changed to an Approved status

*/ 
 
// var myCapId = "FA0000205";
// var myCapId = "CA0002725";
// myCapId = "CA0002529"; // FA0000868 Fictitious Facility
// myCapId = "CA0002504"; // FA0001031 Center for Dentistry
// var myUserId = "ADMIN";

// /* ASA  */  var eventName = "ApplicationSubmitAfter";
// /* WTUA */  var eventName = "WorkflowTaskUpdateAfter";  wfTask = "Application Submittal";	  wfStatus = "Admin Approved";  wfDateMMDDYYYY = "01/27/2015";
// /* IRSA */  var eventName = "InspectionResultSubmitAfter" ; inspResult = "Failed"; inspResultComment = "Comment";  inspType = "Roofing"
// /* ISA  */  var eventName = "InspectionScheduleAfter" ; inspType = "Roofing"
// /* PRA  */  var eventName = "PaymentReceiveAfter";  

// var useProductScript = false;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
// var runEvent = false; // set to true to simulate the event and run all std choices/scripts for the record type.  

/* master script code don't touch */ 
// aa.env.setValue("EventName",eventName); var vEventName = eventName;  var controlString = eventName;  var tmpID = aa.cap.getCapID(myCapId).getOutput(); if(tmpID != null){aa.env.setValue("PermitId1",tmpID.getID1()); 	aa.env.setValue("PermitId2",tmpID.getID2()); 	aa.env.setValue("PermitId3",tmpID.getID3());} aa.env.setValue("CurrentUserID",myUserId); var preExecute = "PreExecuteForAfterEvents";var documentOnly = false;var SCRIPT_VERSION = 3.0;var useSA = false;var SA = null;var SAScript = null;var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 	useSA = true; 		SA = bzr.getOutput().getDescription();	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 	if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }	}if (SA) {	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,useProductScript));	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA,useProductScript));	/* force for script test*/ showDebug = true; eval(getScriptText(SAScript,SA,useProductScript));	}else {	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript));	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useProductScript));	}	eval(getScriptText("INCLUDES_CUSTOM",null,useProductScript));if (documentOnly) {	doStandardChoiceActions2(controlString,false,0);	aa.env.setValue("ScriptReturnCode", "0");	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");	aa.abortScript();	}var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";var doStdChoices = true;  var doScripts = false;var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;if (bzr) {	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");	doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");	doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";	}	function getScriptText(vScriptName, servProvCode, useProductScripts) {	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();	vScriptName = vScriptName.toUpperCase();	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();	try {		if (useProductScripts) {			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);		} else {			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");		}		return emseScript.getScriptText() + "";	} catch (err) {		return "";	}}logGlobals(AInfo); if (runEvent && typeof(doStandardChoiceActions) == "function" && doStdChoices) try {doStandardChoiceActions(controlString,true,0); } catch (err) { logDebug(err.message) } if (runEvent && typeof(doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g,"\r");  aa.print(z); 

//
// User code goes here
//

try 
{
	showDebug = true;


	var tableName = "CAP";

	// childTable = loadASITable(tableName, capId);
	parentTable = loadASITable(tableName,capId);
	
	// logDebugObject(capId);
	// logDebugObject(parentCapId);
	// logDebugObject(aa.cap.getCapID(myCapId).getOutput())

	// get the ASIT table model
	var parentCapId = capId;
	var parentAppSpecificTableModel = aa.appSpecificTableScript.getAppSpecificTableModel(parentCapId,"CAP");
	
	// initialize the rows map used to update the table
	var updateRowsMap = aa.util.newHashMap(); // Map<rowID, Map<columnName, columnValue>>
	
	
	if (parentAppSpecificTableModel.getSuccess()) {
		logDebug("get parentAppSpecificTableModel success");

		// create the table model
		parentAppSpecificTableModel = parentAppSpecificTableModel.getOutput();
		parentAppSpecificTableModel = parentAppSpecificTableModel.getAppSpecificTableModel()
		
		// get the child and parent table fields
		var parentTableFields = parentAppSpecificTableModel.getTableFields(); // List<BaseField>
		
		// since this is from and amendment, the tables should be the same size
		if (parentTableFields != null ){

			// loop through all the fields and rows

			for (var i = 0; i < parentTableFields.size(); i++) {
			// for (var i = 0; i < 100; i++) {
				var parentFieldObject = parentTableFields.get(i); // BaseField
				var parentRowID = parentFieldObject.getRowIndex();
				var parentColumnName = parentFieldObject.getFieldLabel();
				var parentColumnValue = parentFieldObject.getInputValue()
				if (parentColumnName == "CAP Status") {
					logDebug("row id " + parentRowID + " - " + parentColumnName + " is set to " + parentColumnValue);
				}
				// logDebugObject(parentColumnValue);
				// if this is the CAP Status column
				if (parentColumnName == "CAP Status" ){

					// check that the CAP Status Before is not empty and update it
					for (var j = 0; j < parentTableFields.size()  ; j++) {
						if (parentTableFields.get(j).getRowIndex() == parentRowID) {
							tmpFieldObject = parentTableFields.get(j);
							myFieldValue = tmpFieldObject.getInputValue();
							// logDebug(tmpFieldObject.getFieldLabel() + " - " + myFieldValue);

							// if CAP Status Before is not empty and it is not equal to CAP Status, update date it 
							if (tmpFieldObject.getFieldLabel() == "CAP Status Before" && myFieldValue && myFieldValue != parentColumnValue ) {
								setUpdateColumnValue(updateRowsMap, parentRowID, "CAP Status Before", parentColumnValue);
								logDebug("CAP Status Before" + " set to " + parentColumnValue + " on rowIndex " + parentRowID );
							}
						}
					}
				}
			}

		}else{
			logDebug("parentTableFields is null or empty");
		}
	}else{
		logDebug("get parentAppSpecificTableModel failed");
	}
	if (!updateRowsMap.empty) {
		myResult = updateAppSpecificTableInfors(tableName, parentCapId, updateRowsMap);
		if (myResult.getSuccess()) {
			logDebug("updateAppSpecificTableInfors Success");
		}else{
		  logDebug(myResult.getErrorMessage());
		}
	}else{
		logDebug("updateRowsMap was empty");
	}
}

catch (err) {
	logDebug("A JavaScript Error occured: " + err.message);
}
// end user code
// aa.env.setValue("ScriptReturnCode", "1"); 	
aa.env.setValue("ScriptReturnMessage", debug)
  
 

