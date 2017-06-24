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

	dataObj.years = getYears();
	dataObj.months = getMonths();

	addEventListeners();
	
	fillYearSelection();

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
	<div class="tweet">
    	<div class="tweetHeader"><div class="date"></div><div class="RT"></div></div>
    	<div class="tweetText"></div>
  </div>
  */

  $(".tweetsHolder").html('')

  var tweetText, tweetDate, isRT;

  var numberOfTweets = arrTweets.length;
  var currTweet;

  var strHTML;

  var strHTML1 = '<div class="tweet';
  var strHTML2 = '"><div class="tweetHeader"><div class="date">';
  var strHTML2a = '</div><div class="RT">'
  var strHTML3 = '</div></div><div class="tweetText">';
  var rtUser;


  for (var i=0; i<numberOfTweets; i++)
  {
  		strHTML = strHTML1;
  		currTweet = arrTweets[i];

  		
		tweetDate = getDateTime(currTweet.created_at).date;

  		if(!currTweet.retweeted_status)
  		{
			//if tweet is NOT a retweet do the following   		
	  		tweetText = currTweet.text;		
	  		strHTML += strHTML2 + tweetDate + strHTML3 + tweetText + '</div>'
  		}
  		else
  		{
  			rtUser = currTweet.retweeted_status.user.screen_name;
  			tweetText = currTweet.retweeted_status.text;
  			strHTML += ' retweeted' + strHTML2 + tweetDate + strHTML2a + '@' + rtUser + strHTML3 + tweetText + '</div>'	
  		}

  		$(".tweetsHolder").append(strHTML);
  }

}


/*
	load current month year js 

*/

function loadJS(fileName) {
	// body...

	$.getScript(fileName)
	  .done(function( script, textStatus ) {
	    // console.log( textStatus );



	    addTweets(Grailbird.data[currTweetIndex.var_name])


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
	var retObject = {};


	var strDate = arrDateTimeOffset[0];

	retObject.date = normalizeDate(strDate);

	retObject.time = arrDateTimeOffset[1];

	//time stored in the twitter data is 5 hours 30 mins behind the actual time of posting the tweet. 
	//adjusting for that time. 
	var arrTime = arrDateTimeOffset[1].split(":");
	// var strHours = 

	return retObject;
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


function addTime(strDateTime) {
	// body...
	var arrDateTime = strDateTime.split(" ");
	var strDate = arrDateTime[0];
	var strTime = arrDateTime[1];

	var arrTime = strTime.split(":");
	var nHours = Number(arrTime[0]);
	var nMins = Number(arrTime[1]);
	var nSecs = Number(arrTime[2]);

	// var 

}
