// Perform Washington State CEDARS validations for discipline entries in Skyward SMS 2.0
// v1.0, Last updated 2024-07-01.  Includes CEDARS validations up to the 2024-2025 year.
// To use, attach this code to the Add/Edit Action Summary screen (sdiscedit007.w)
// Created by Adam Yearout <ayearout@royalsd.org>, Royal School District 160, Royal City, WA
// Some code taken from the EasySkyCoder Project by John Jameson
// https://jamesonpublic.squarespace.com/easyskycoder

// This work and EasySkyCoder are licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// https://creativecommons.org/licenses/by-nc-sa/4.0/

// Define error strings that will be used to notify user of issues. Change or localize as needed.
const TT_IS_ZERO = "Total Time field cannot be zero.";
const TT_IS_HIGH = "Total Time field cannot be greater than 365.";
const TT_IS_MORE = "Total Time field cannot be greater than the Duration of Exclusionary Action Days.";
const DD_IS_ZERO = "Duration of Exclusionary Action Days cannot be zero.";
const DD_IS_HIGH = "Duration of Exclusionary Action Days cannot be greater than 365.";
const RP_IS_BEFORE_OD = "Readmit Petition Submit date cannot be before the action Ordered Date.";
const RG_IS_BEFORE_OD = "Readmit Petition Granted date cannot be before the action Ordered Date.";
const RG_IS_BEFORE_RP = "Readmit Petition Granted date cannot be before the Readmit Petition Sumbit date.";
const ERR_TITLE = "Discipline Action Errors";
const ERR_NONE = "There are currently no date or time errors in this discipline action.";
const ERR_HEAD = "The following date or time errors exist in this discipline action:";
const ERR_TAIL = "Corrections must be made before this action entry can be saved.";

// Some data sets to check what is required for a suspension type.
// Changes to validations in CEDARS can easily be modified here.
// Note that suspension codes map to the Skyward suspension type code table, *not* CEDARS.

// All current valid suspension codes *except* NA and NE.
const susIsNotNA = new Set(["I", "E", "EE", "L", "S", "C"]);
// Suspension code requireds Appeal Code be completed.
const susReqAppeal = new Set(["E", "EE", "L"]);
// Suspension type requires Reengagement Plan be completed.
const susReqReeng = new Set(["E", "L"]);
// Suspension type requires Petition for Extension be completed.
const susReqPetition = new Set(["E"]);

// Set the base cutoff school year to perform validations.
const cutYear = 2023;

// Initialize document elements we'll be referencing
var sSYr = document.getElementById("sSchlYr");           // Action school year
var sSus = document.getElementById("sSuspendType");      // Suspension type drop-down
var sRMD = document.getElementById("dWAReengageMeet");   // Reengagement Meeting date field
var sSTT = document.getElementById("tTime");             // Total Time field
var sSDD = document.getElementById("tWAExclusionTime");  // Duration of Exclusionary Action Days field
var sSRP = document.getElementById("dWAReadmitSubmit");  // Readmit Petition Submit date field
var sSRG = document.getElementById("dWAReadmitGranted"); // Readmit Petition Granted date field

// We need to prefetch the current value for Suspension Type to see if it changes.
var curSus = sSus.value;

// Main Program functions begins here.

// A function to see if the suspension type has changed without direct user input
function suspChanged() {
        if (curSus !== sSus.value) runAll();
}
// Mark fields as required depending on suspension type
function validateSuspensionType() {
        curSus = sSus.value;
    if (susIsNotNA.has(curSus) && sSYr.value >= cutYear) {
        flagAsRequired('sWAAcaServ','lblAcademicServices');
        flagAsRequired('sWABehServ','lblBehaviorServices');
        $("#sDaysHours option[value='H']").remove();
    } else {
        unFlagAsRequired('sWAAcaServ','lblAcademicServices');
        unFlagAsRequired('sWABehServ','lblBehaviorServices');
        let optionExists = ($("#sDaysHours option[value='H']").length > 0);
        if (!optionExists){
            $("#sDaysHours").append(new Option('Hours', 'H'));
        }
    }
    susReqAppeal.has(curSus) && sSYr.value >= cutYear ? flagAsRequired('sWAAppealCode','lblAppealCode') : unFlagAsRequired('sWAAppealCode','lblAppealCode');
    susReqReeng.has(curSus) && sSYr.value >= cutYear ? flagAsRequired('sWAReengagePlan','lblReengagementPlan') : unFlagAsRequired('sWAReengagePlan','lblReengagementPlan');
    susReqPetition.has(curSus) && sSYr.value >= cutYear ? flagAsRequired('sWAPetition','lblPetitionforExtensionofanExpulsion') : unFlagAsRequired('sWAPetition','lblPetitionforExtensionofanExpulsion');
}
// Require Reengagement Interpreter if a date is entered for Reengagement Meeting
// This validation and field R27 was added in the CEDARS update for 2023-2024
function validateInterpreter() {
    sRMD.value != "" && sRMD.value != "undefined" && sSYr.value >= 2024 ? flagAsRequired('sWAReengageInterp','lblReengagementInterpreterServicesRequested') : unFlagAsRequired('sWAReengageInterp','lblReengagementInterpreterServicesRequested');
}
// Check all date and time fields that need verification
function timeCheck() {
        errArray = [];
        curSus = sSus.value;
    let ttFlag = false, ddFlag = false, rpFlag = false, rgFlag = false;
    let tt = Number(sSTT.value), dd = Number(sSDD.value);
    if (susIsNotNA.has(curSus) && sSYr.value >= cutYear) {
        if (tt == 0 ) {
                        ttFlag = true;
                        errArray.push(TT_IS_ZERO);
                }
                if (tt > 365) {
                        ttFlag = true;
                        errArray.push(TT_IS_HIGH);
                }
        if (dd == 0) {
                        ddFlag = true;
                        errArray.push(DD_IS_ZERO);
                }
                if (dd > 365) {
                        ddFlag = true;
                        errArray.push(DD_IS_HIGH);
                }
        if (tt > dd) {
            ttFlag = true;
            ddFlag = true;
                        errArray.push(TT_IS_MORE);
        }
    }
    let od = new Date($("#tOrdDate").attr('value'));
    let rp = new Date(sSRP.value);
    let rg = new Date(sSRG.value);
    if (rp && sSYr.value >= cutYear) {
        if (od > rp) {
                        rpFlag = true;
                        errArray.push(RP_IS_BEFORE_OD);
                }
    }
    if (rg && sSYr.value >= cutYear) {
        if (od > rg) {
                        rgFlag = true;
                        errArray.push(RG_IS_BEFORE_OD);
                }
        if (rp > rg) {
                        rgFlag = true;
                        errArray.push(RG_IS_BEFORE_RP);
                }
    }
    highlightField(sSTT, ttFlag);
    highlightField(sSDD, ddFlag);
    highlightField(sSRP, rpFlag);
    highlightField(sSRG, rgFlag);
    ttFlag || ddFlag || rpFlag || rgFlag ? disableButton($("#bSave")) : enableButton($("#bSave"));
    $("#bJjpErrors0").html('Errors (' + errArray.length + ')');
    if (errArray.length > 0) {
            $("#bJjpErrors0").css("background", "linear-gradient(to bottom, #ffffff 0%,#ff6666 100%)");
    } else {
            $("#bJjpErrors0").css("background", "");
    }
}
// Build our and show our error message
function showErrors() {
    let errText = "";
    if (errArray.length == 0) {
        errText = `${ERR_NONE}`;
    } else {
        errText = `${ERR_HEAD}</p><ul>${errArray.map(err => `<li>${err}</li>`).join('')}</ul><p>${ERR_TAIL}`;     
    }
        message(errText,ERR_TITLE);
}
// Function to unflag a field as required since there's no built in way in SkyCoder
// Taken with modification from the WSIPC SkyCoder Tips and Tricks Guide
function unFlagAsRequired(pField,pLabel) {
    if (!pField || !pLabel) return;
    document.getElementById(pLabel).innerHTML = document.getElementById(pLabel).innerHTML.replace('*&nbsp;','&nbsp;&nbsp;');
    for (let i = 0; i < gExtraValidationField.length; i++) {
        if (gExtraValidationField[i] != "" && typeof(gExtraValidationField[i]) != "undefined") {
            if (gExtraValidationField[i]==pField) gExtraValidationField[i]="";
        }
    }
    for (let i = 0; i < gExtraValidationLabel.length; i++) {
        if (gExtraValidationLabel[i] != "" && typeof(gExtraValidationLabel[i]) != "undefined") {
            if (gExtraValidationLabel[i]==pLabel) gExtraValidationLabel[i]="";
        }
    }
}
// Function to add our listeners
function addEventListeners(elements, events, handler) {
        elements.forEach(element => events.forEach(event => element.addEventListener(event, handler)));
}
// Run all of our current validations
function runAll() {
        validateSuspensionType();
        validateInterpreter();
        timeCheck();
}

// Functions below this point are taken with modification from the EasySkyCoder project.
// Included here instead of a remote reference due to the project no longer being maintained.
function addButton(t, r, o, a, v) {
    v = v || !1, buttonID = createJjpId(r, "button"), v ? $("#" + a).before($("#" + a).clone().attr("id", buttonID)) : $("#" + a).after($("#" + a).clone().attr("id", buttonID)), setButtonConfig("#" + buttonID, t, o);
}
function createJjpId(r, o) {
    o = o || !1;
    let a = toTitleCase(removePuncSpaces(r)), v = "d", m = 0;
    switch (o) {
        case "button":
            v = "b";
            break;
        case "input":
            v = "i";
            break;
        case "p":
            v = "p";
    }
    a = v + "Jjp" + a;
    for (m = 0, t = !0; t;) $("#" + a + m).length > 0 ? m++ : t = !1;
    return a + m;
}
function setButtonConfig(e, r, o) {
    $(e).attr("href", o), -1 === o.toUpperCase().indexOf("JAVASCRIPT:") && $(e).attr("target", "_blank"), $(e).html(r), $(e).removeAttr("onclick"), $(e).addClass("jjpButton"), $(e).removeClass("buttonDisabled");
}
function toTitleCase(e) {
    return e.replace(/\w\S*/g, function(e) {
         return e.charAt(0).toUpperCase() + e.substr(1).toLowerCase();
    });
}
function removePuncSpaces(e) {
    return newStr = e.replace(/[.,-\/#!$%\^&\*\"\';:@?<>+{}=\-_`~()]/g, ""), newStr = newStr.replace(/ /g, ""), newStr = newStr.replace(/\[/g, ""), newStr = newStr.replace(/\]/g, ""), newStr;
}
function highlightField(e, r) {
    r ? $(e).css("border", "4px solid red") : $(e).css("border", "");
}
function disableButton(o) {
    for (f = 0; f < o.length; f++) $(o[f]).addClass("buttonDisabled"), $(o[f]).removeClass("button");
}
function enableButton(o) {
    for (f = 0; f < o.length; f++) $(o[f]).removeClass("buttonDisabled"), $(o[f]).addClass("button");
}

// Add our listeners.
addEventListeners([sSus, sSYr], ["blur", "change"], runAll);
addEventListeners([sRMD], ["blur", "change"], validateInterpreter);
addEventListeners([sSRP, sSRG, sSTT, sSDD], ["blur", "change"], timeCheck);
document.body.addEventListener("click", suspChanged);
// Add our error notification button
var errArray = [];
addButton('Errors (' + errArray.length + ')','Errors','Javascript:showErrors()','bCancel');
// Run our validation functions once on window load
runAll();