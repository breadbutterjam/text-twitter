var versionNumber = '0.0038';
/*
initializing standard Grailbird object. This is required to access the data as provided by twitter

*/

var Grailbird = function (type, date, data) {
  Grailbird.data = Grailbird.data || {};
  Grailbird.data[type+'_'+date] = data;
};

Grailbird.data = Grailbird.data || {};

/*TWITTER CODE ENDS HERE */

var arrMonthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]; 

//this array will be used to quickly reference the item of current month and year from the tweet index object.
//if data for 2012 June is stored in tweet_index[127] store this index (127) as arrDictionary[2012][6]	
var arrDictionary = [];

var currTweetIndex = '';

/*
create an object with data as described below

{
	years : array of years that have data;
	months: object with years as key and months in that year as an array. 
			e.g. object.months.2017 should give array of months that have data
}

*/

var dataObj = {};

function bodyLoaded(argument) {
	// body...

	ShowHidePreloader(true);

	dataObj.years = getYears();
	dataObj.months = getMonths();

	addEventListeners();
	
	fillYearSelection();

	console.log(versionNumber)

}

function ShowHidePreloader(bShow) {
	// body...
	if (bShow === false)
	{
		$('.Preloader').hide();
		$('.tweetsHolder').css('opacity', 1);
	}
	else 
	{
		$('.Preloader').show();
		$('.tweetsHolder').css('opacity', 0.1);
	}
	
}

/*
	bind eventlisteners in this function
*/

function addEventListeners(argument) {
	// body...
	$("#yearselector").bind('change', yearSlectionChanged);
	$('.monthyearselector').bind('change', updateCurrentMonthYear);


	//enable cache loading to prevent multiple downloads of same tweet data file
	$.ajaxSetup({
	  cache: true
	});
}

function makeDateClickable(argument) {
	// body...
	// console.log("makeDateClickable");
	$('.date').on("click", onDateClick);
}


function onDateClick(argument) {
	// body...
	// console.log("onDateClick");
	// console.log($(this));

	var strOtherInfo = $(this).attr('theotherdateinfo');
	var strHTML = $(this).html();

	$(this).attr('theotherdateinfo', strHTML);
	$(this).html(strOtherInfo);
}


/*
	update value of current month year
*/
function updateCurrentMonthYear(argument) {
	// body...
	var currMonth = String($("#monthselector").val());
	var currYear = String($("#yearselector").val());

	// currMonthYear = currYear + "_" + currMonth;

	currTweetIndex = tweet_index[arrDictionary[currYear][currMonth]]
	


	loadJS(currTweetIndex.file_name);
}

/*
	year select box change handler
*/
function yearSlectionChanged(event) {
	// body...
	//console.log("yearSlectionChanged")

	//re-fill month selection 
	fillMonthSelection();
}

/*
	fill data for the year select box
*/
function fillYearSelection(argument) {
	// body...
	var arrYears = dataObj.years;
	
	var numOfYears = arrYears.length;

	var strSelectBoxHTML = '';
	
	//get the maximum (latest) year in the data set. This value will be used to select the option in the select box.
	//initialize it to first value. 
	var latestYear = arrYears[0];

	for (var i = 0; i<numOfYears; i++)
	{
		if(latestYear < arrYears[i])
		{
			latestYear = arrYears[i];
		}

		strSelectBoxHTML += '<option value="' + arrYears[i] + '">' + arrYears[i] + '</option>';
	}

	$("#yearselector").html(strSelectBoxHTML);
	$("#yearselector").val(latestYear).change();

}

/*
	fill data for month select box
*/

function fillMonthSelection() {
	// body...
	var arrMonths = dataObj.months[$("#yearselector").val()];
	var numOfMonths = arrMonths.length;

	var latestMonth = arrMonths[0];


	var strSelectBoxHTML = '';

	for (var i = 0; i<numOfMonths; i++)
	{
		if(latestMonth < arrMonths[i])
		{
			latestMonth = arrMonths[i];
		}

		strSelectBoxHTML += '<option value="' + arrMonths[i] + '">' + arrMonthNames[arrMonths[i] - 1] + '</option>';
	}

	$("#monthselector").html(strSelectBoxHTML);
	$("#monthselector").val(latestMonth);
}

/*
	returns object with months data added in each year
	return_object {
	2017: [array of months in 2017]
	}
*/

function getMonths() {
	// body...
	var months = {};
	var itemLen = tweet_index.length;
	var currItem = {};

	var numOfYears = dataObj.years.length;

	//intialize array for all years that have data
	for (var i=0; i<numOfYears; i++)
	{
		months[dataObj.years[i]] = [];

		//also initializing arrays in arrDictionary 
		arrDictionary[dataObj.years[i]] = [];
	}

	
	for (i=0; i<itemLen; i++)
	{
		currItem = tweet_index[i];


		months[currItem.year].push(currItem.month)


		//while going through the tweet_index data add data to the arrDictionary 
		arrDictionary[currItem.year][currItem.month] = i;
		
	}

	return months;
}


/*
returns an array of years that have data
*/

function getYears() {
	// body...
	var itemLen = tweet_index.length;
	var currItem = {};
	var arrYears = [];

	for (i=0; i<itemLen; i++)
	{
		currItem = tweet_index[i];

		// check if year is already added to the arrYears array
		if (arrYears.indexOf(currItem.year) === -1)
		{
			arrYears.push(currItem.year)
		}
		
	}

	return arrYears;

}


/*
function to be used to add tweet data to dom. 
function will be passed an array containing all tweets to be added. 

*/
function addTweets(arrTweets) {
	// body...
	/*
	HTML structure to be used to add tweets
	<div class="tweet retweeted">
    	<div class="tweetHeader"><div class="date"></div><div class="RT"></div></div>
    	<div class="tweetText"></div>
  </div>
  */

  $(".tweetsHolder").html('')

  var tweetText, tweetDateTime, isRT;

  var numberOfTweets = arrTweets.length;
  var currTweet;

  var strHTML;

  var strHTML1 = '<div class="tweet';
  var strRTClass;
  var strHTML2 = '">'
  var strHeaderHTML = '<div class="tweetHeader"><div ';
  var strHeaderHTML1a = 'theotherdateinfo="'
  var strHeaderHTML1b = '" class="date">'
  var strHeaderHTML2;
  var strHTML3 = '</div></div><div class="tweetText">';
  var strHTML4 = '</div>'
  var rtUser;
  var mediaURLInText, mediaURLToUse, mediaLinkHTML;
  var strReadableDateTimeInfo;

  for (var i=0; i<numberOfTweets; i++)
  {
  		// strHTML = strHTML1;
		strRTClass = '';
		rtUser = '';
		strHeaderHTML2 = '';

  		currTweet = arrTweets[i];

  		tweetDateTime = getDateTime(currTweet.created_at);
  		shortDate = normalizeDate(tweetDateTime.date);
  		strReadableDateTimeInfo = getReadableDateTime(tweetDateTime);

  		isRT = (currTweet.retweeted_status === undefined) ? false : true

  		if(isRT)
  		{
			//if tweet is a retweet do the following   		
			rtUser = '@' + currTweet.retweeted_status.user.screen_name;
  			tweetText = currTweet.retweeted_status.text;
	  		strRTClass = ' retweeted'
	  		strHeaderHTML2 = '</div><div class="RT">';	  		
  		}
  		else
  		{
  			tweetText = currTweet.text;		
  		}

  		//the twitter data contains media information here >> currTweet.entities.media[0].url
  		//it will be present in the tweetText. this needs to be replaced with an actual link. 

  		if (currTweet.entities.media.length > 0)
  		{
  			//if tweet contains media
  			mediaURLInText = currTweet.entities.media[0].url;
  			mediaURLToUse = currTweet.entities.media[0].media_url;
  			mediaLinkHTML = '<a href="'+ mediaURLToUse + '" target="_blank">media</a>'
  			tweetText = tweetText.replace(mediaURLInText, mediaLinkHTML);
  		}
  		else if (currTweet.entities.urls.length > 0)
  		{
  			mediaURLInText = currTweet.entities.urls[0].url;
  			mediaURLToUse = currTweet.entities.urls[0].expanded_url;
  			mediaLinkHTML = '<a href="'+ mediaURLToUse + '" target="_blank">media</a>'
  			tweetText = tweetText.replace(mediaURLInText, mediaLinkHTML);	
  		}


  		strHTML = strHTML1 + strRTClass + strHTML2 + strHeaderHTML + strHeaderHTML1a + strReadableDateTimeInfo + strHeaderHTML1b + shortDate + strHeaderHTML2 + rtUser + strHTML3 + tweetText + strHTML4;

  		$(".tweetsHolder").append(strHTML);
  }

}


/*
	load current month year js 

*/

function loadJS(fileName) {
	// body...
	ShowHidePreloader(true);

	$.getScript(fileName)
	  .done(function( script, textStatus ) {
	    // console.log( textStatus );

	    
	    ShowHidePreloader(false);
	    addTweets(Grailbird.data[currTweetIndex.var_name])
		makeDateClickable();


	  })
	  .fail(function( jqxhr, settings, exception ) {
	    $( "div.log" ).text( "Triggered ajaxError handler." );
	});
}


/*
	return usable time given the time string provided provided
	twitter provides created at in the format "date"[space]"time"[space]"offset" e.g. 2017-05-31 09:56:00 +0000

*/

function getDateTime(strDateTime) {
	// body...
	var arrDateTimeOffset = strDateTime.split(" ");
	
	//time stored in the twitter data is at +00000 GMT, to get the time in IST we add 5 hours 30 mins
	var oAddDateTime = {};
	oAddDateTime.time = "05:30:00"; 

	var oInitialDateTime = {};
	oInitialDateTime.date = arrDateTimeOffset[0];
	oInitialDateTime.time = arrDateTimeOffset[1];


	var oFinalDateTime = addTime(oInitialDateTime, oAddDateTime);

	retObject = {};
	retObject.date = oFinalDateTime.date;
	retObject.time = oFinalDateTime.time;

	return retObject;
}

/*
	function takes date and time information object and returns a readable long format,
	object.date will be in the "yyyy-mm-dd" format
	object.time will be in the "hh:mm:ss" format
	the function will return a readable date time string in the following format "dd, mmmm hh:mm PM/AM" 

*/

function getReadableDateTime(oDateTime) {
	// body...

	// var strReadableDateTime = "07 June, 08:14 PM";
	var strReadableDateTime = "";
	var strDate = oDateTime.date;
	var strTime = oDateTime.time;

	strReadableDateTime = normalizeDate(strDate) + ", " + getTimeInAMPM(strTime);

	return strReadableDateTime;
}


/*
	function takes time in 24h format as "hh:mm:ss" and returns time in AM/PM "hh:mm"

*/
function getTimeInAMPM(strLongTime) {
	// body...
	var arrTime = strLongTime.split(":");
	var nHours = Number(arrTime[0]);

	// var nMins = Number(arrTime[1]);
	// var nSecs = Number(arrTime[2]);

	var arrAMPM = ['AM', 'PM'];
	var strReturnHours, strReturnMins, strReturnAMPM;
	strReturnMins = arrTime[1];

	if (nHours < 12)
	{
		//if time is after noon, add AM and keep time as is. 
		strReturnAMPM = arrAMPM[0];
		strReturnHours = String(nHours)
	}
	else
	{
		strReturnHours = String(nHours % 12);
		strReturnAMPM = arrAMPM[1];
	}

	return strReturnHours + ":" + strReturnMins + " " + strReturnAMPM;
}


/*
	function takes date in the yyyy-mm-dd format and returns a string with date in dd mmmmm format, i.e. 27 June
*/

function normalizeDate(strDateMonthYear) {
	// body...
	var arrDateMonthYear = strDateMonthYear.split("-");
	
	// var strYear = arrDateMonthYear[0];
	var strDate = arrDateMonthYear[2];
	var strMonth = arrDateMonthYear[1];
	

	var strReadableMonth = arrMonthNames[Number(strMonth) - 1];

	return strDate + " " + strReadableMonth;
}

/*
	function checks if length of string is less than 2 characters, it will prepend zeroes to it. 
	if function is passed "7", it returns "07"
*/
function prependZeroes(argument) {
	// body...
	if (argument.length === 1)
	{
		return "0" + argument;
	}
	else if(argument.length === 0)
	{
		return "00";
	} else if (argument.length === 2)
	{
		return argument;
	}

}

/*
	function takes two arguments, initial date time, and time to add. 
	initial date time will be an object in the form object.date = "yyyy-mm-dd" and object.time = "hh:mm:ss"
	time to add will be in the same format as initial date and time. If no day is to be added, send object.date as null. 
*/


function addTime(oInitialDateTime, oAddDateTime) {
	// body...

	//split the intial date into year, month, and date. store it in this array
	var arrInitialDate = oInitialDateTime.date.split(" ");

	//split initial time into hours, minutes, and seconds and store it in this array
	var arrInitialTime = oInitialDateTime.time.split(":");

	//store hours, mins, and secs individually in these variables
	var nInitialHour, nInitialMins, nInitialSecs;
	nInitialHour = Number(arrInitialTime[0]);
	nInitialMins = Number(arrInitialTime[1]);
	nInitialSecs = Number(arrInitialTime[2]);

	//store initial year, month, and date in these following variables
	var nInitialYear, nInitialMonth, nInitialDate;
	nInitialYear = Number(arrInitialDate[0]);
	nInitialMonth = Number(arrInitialDate[1]);
	nInitialDate = Number(arrInitialDate[2]);

	//if date is to be added, i.e. if oAddDateTime.date is not null
	if (oAddDateTime.date)
	{
		//split the date to add into year, month, and date. store it in this array
		var arrAddDate = oAddDateTime.date.split(" ");	

		//store initial year, month, and date in these following variables
		var nAddYear, nAddMonth, nAddDate;
		nAddYear = Number(arrAddDate[0]);
		nAddMonth = Number(arrAddDate[1]);
		nAddDate = Number(arrAddDate[2]);
	}
	

	//split initial time into hours, minutes, and seconds and store it in this array
	var arrAddTime = oAddDateTime.time.split(":");

	//store hours, mins, and secs individually in these variables
	var nAddHour, nAddMins, nAddSecs;
	nAddHour = Number(arrAddTime[0]);
	nAddMins = Number(arrAddTime[1]);
	nAddSecs = Number(arrAddTime[2]);

	var nFinalHour, nFinalMins, nFinalSecs;
	var nCarryDate, nCarryHour, nCarryMins;

	nFinalSecs = (nInitialSecs + nAddSecs) % 60;
	nCarryMins = Math.floor((nInitialSecs + nAddSecs) / 60);

	nFinalMins = (nInitialMins + nAddMins + nCarryMins) % 60;
	nCarryHours = Math.floor((nInitialMins + nAddMins + nCarryMins) / 60)

	nFinalHours = (nInitialHour + nAddHour + nCarryHours) % 24;
	nCarryDate = Math.floor((nInitialHour + nAddHour + nCarryHours) / 24)

	//not added code to handle shifting of dates. 
	
	var strFinalTime;
	strFinalTime = prependZeroes(String(nFinalHours)) + ":" + prependZeroes(String(nFinalMins)) + ":" + prependZeroes(String(nFinalSecs));


	var returnObject = {};

	returnObject.date = oInitialDateTime.date;
	returnObject.time = strFinalTime;

	return returnObject;

}

/* trial data for checking addTime function 
var oInitial = {};
oInitial.time = "05:16:42";
oInitial.date = "2017-06-15";
var oAddDateTime = {};
oAddDateTime.time = "05:30:00";
*/