/*Notice this module makes extensive use of the `var` keyword
which is frowned upon in subsequent vesrions of JS (e.g ES6+)
due to its hoisting nature.*/

"use strict";//use strict directive for browsers still using es5 js

function calculate() {
  var amount = document.getElementById('amount')
  var apr = document.getElementById('apr')
  var years = document.getElementById('years')
  var zipcode = document.getElementById('zipcode')
  var payment = document.getElementById('payment')
  var total = document.getElementById('total')
  var totalinterest = document.getElementById('totalinterest')

  //Get the inputs from their respective elements and assume they are all valid
  //(this is a basic interest app and so far has no input validation)
  //convert interest from percentage to decimal, and convert from an annual rate
  //tp a monthly rate.
  var principal = parseFloat(amount.value);
  var interest = parseFloat(apr.value) / 100 / 12;
  var payments = parseFloat(years.value) * 12;

  //compute the monthly pmt figure
  var x = Math.pow(1 + interest, payments) //(1 + interest) ^number of payments (e.g. 12)
  var monthly = (principal*x*interest)/(x-1)

  //If the result is a finite number, the user's input was good and there
  //are meaningul results to display (remember, no input validation in this version)
  if (isFinite(monthly)) {
    //Fill in the output fields rounding to 2 decimal places
    payment.innerHTML = monthly.toFixed(2)
    total.innerHTML = (monthly * payments).toFixed(2)
    totalinterest.innerHTML = ((monthly*payments)-principal).toFixed(2)

    //save the user's input so it can be restored on the next visit
    save(amount.value, apr.value, years.value, zipcode.value)


    //Ads: find and display local lenders, ignoring network errors
    try { // Catch any errors that occur here
      getLenders(amount.value, apr.value, years.value, zipcode.value)
      console.log('got lenders')
    }
    catch(e) { /* And ignore all those errors*/ }
    // Finally, chare loan balance, interest and Equity payemnts

    chart(principal, interest, monthly, payments)
  } else {
    //Result was NaN or infinite (meaning incomplete or invalid input).
    //Clear any previously displayed output.
    payment.innerHTML       = "" // erase the content of the following elements
    total.innerHTML         = ""
    totalinterest.innerHTML = ""
    chart()                //invoked with no args, clears the chart
  }
} // close calculate()

// Save user's input props in localStorage object

function save(amount, apr, years, zipcode) {
  if (window.localStorage) { //only do the following if browser supports it
    localStorage.loan_amount  = amount
    localStorage.loan_apr     = apr
    localStorage.loan_years   = years
    localStorage.loan_zipcode = zipcode
  }
} // close save()

//Automatically attempt to restore inout fields when doc reloads
window.onload = function() {
  // If the browser supports localStorage and there is stored data available ..
  if (window.localStorage && localStorage.loan_amount) {
    document.getElementById('amount').value  = localStorage.loan_amount
    document.getElementById('apr').value     = localStorage.loan_apr
    document.getElementById('years').value   = localStorage.loan_years
    document.getElementById('zipcode').value = localStorage.loan_zipcode
  }
}

/****************GETLENDERS: getLenders() function***********************/
//pass the user's input to a server-side script which can (in theory) return
//a list of local lenders interested in making loans. This example does not acutally
//include an implementation of such a lender-finding service. But if such a service
//did exist this fn would find it

function getLenders(amount, apr, years, zipcode) {
  //If the brownwer doesn't support XMLHttpRequest obejects, then do nothing (ie. `return` with nothing)
  if (!window.XMLHttpRequest) return

  //Find the element in which to display the list of lenders
  var ad = document.getElementById('lenders')
  if (!ad) return      //Quit if there is no element to output it into

  //Encode the user's input as query parameters in a URL
  var url = "getLenders.php"  +  //service url plus
  "?amt" + encodeURIComponent(amount) + // user data in query string
  "?apr" + encodeURIComponent(apr) +
  "?yrs" + encodeURIComponent(years) +
  "?zip" + encodeURIComponent(zipcode)

  //Fetch the contents of that URL using the XMLHttpRequest obeject
  var req = new XMLHttpRequest() //Begin a new XMLHttpRequest
  req.open("GET", url)           //An HTTP GET request for the url
  req.send(null)                 //Send the request with no body. (Blocked by CORS policy)

  //Prior to returning, register and event handler function that will be called
  //at some time later when the HTTP server's response arrives. This is a common
  //type of asynchrounous programming in client-side JS
  req.onreadystatechange = function() {
    if (req.readystate == 4 && req.status == 200) {
      // If we get to this point, we have a complete valid HTTP response
      var response = req.responseText //Http response as a string
      var lenders = JSON.parse(response) // Parese it to a JS array

      // Convert the array of lender objects to a string of HTML
      var list = ""
      for(var i = 0; i < lenders.length; i++) {
        list += "<li></li><a href='" + lenders[i].url +"'>" +
        lenders[i].name + "</a>"
      }

      //Display the HTML in the element from above
      ad.innerHTML = "<ul>" + list + "</ul>"
    }
  }
} //close getLenders ******************************





/****************CHART: chart() function****************/
//Chart monthly loan balance, interest and equity in an HTML <canavas> element
//If called with no args, then just erase the chart that was drawn previously
function chart(principal, interest, monthly, payments) {
  var graph = document.getElementById("graph") //get the <canvas> tag
  graph.width = graph.width //Clears and resets the <canvas> element

  //If called with no args OR if this current browser doesn't support graphics
  //inside a <canvas> element then just return
if(arguments.length == 0 || !graph.getContext) return;

//Get the context object for the canavas
var g = graph.getContext("2d") //All drawing is done with this object
var width = graph.width, height = graph.height //get canvas size (, so var only needs to be typed once)

//fns to convert payment numbers and dollar amounts to pixels
function paymentToX(n) { return n * width/payments; }
function amountToY(a) { return height - (a * height/(monthly*payments*1.05)); }

//payments are a straight line from (0,0) to (payments, monthly*payments)
g.moveTo(paymentToX(0), amountToY(0)) //start at lower-left

g.lineTo(paymentToX(payments),        //draw to upper-right
         amountToY(monthly*payments))

g.lineTo(paymentToX(payments), amountToY(0)) //Down to lower-right
g.closePath()                                //and back to start
g.fillStyle = "#f88"                      //light red
g.fill()                                     //fill the triangle
g.font = "bold 12px sans-serif"              //define a font
g.fillText("Total Interest Payments", 20, 20)//Draw text in legend

//Cummulative eqiuty is non-linear and little more difficult to Chart
var equity = 0
g.beginPath()                           //Begin a new shapte
g.moveTo(paymentToX(0), amountToY(0))   //Start at lower-left
for(var p = 1; p <= payments; p++) {
  // for each pmt, figure out how much is interest
  var thisMonthsInterest = (principal-equity)*interest
  equity += (monthly - thisMonthsInterest)   //The rest goes to Equity
  g.lineTo(paymentToX(p), amountToY(equity)) //line to this point
} //close for
g.lineTo(paymentToX(payments), amountToY(0)) //line back to X-axis
g.closePath()                                //And back to start point
g.fillStyle = "green"                      //Now use green color to paint..
g.fill()                                     //...and fill the area under the curve
g.fillText("Total Equity", 20, 35)           //...and also label it in green

//Loop again, just as above, but chart loan balance as a thick black line
var bal = principal
g.beginPath()
g.moveTo(paymentToX(0), amountToY(bal))
for(var p = 1; p <= payments; p++) {
  var thisMonthsInterest = bal * interest
  bal -= (monthly - thisMonthsInterest)      //the rest goes to equity
  g.lineTo(paymentToX(p), amountToY(bal))    //draw line to this point

}//close for
g.lineWidth = 3                               //Use a thick line
g.stroke()                                    //draw the balance curve
g.fillStyle = "black"                         //switch to black text
g.fillText("Loan Balance", 20, 50)            //Legend entry

//Now make yearly tick marks and year numbers on X-axis
g.textAlign = "center"                        //Center text over ticks
var y = amountToY(0)                           //Y coordinate of X-axis
for(var year=1; year*12 <= payments; year++) { //For each year ...
  var x = paymentToX(year*12)                  //compute tick position
  g.fillRect(x-0.5, y-3, 1, 3)                 //Draw the tick
  if (year == 1) g.fillText("year", x, y-5)    //Label the axis
  if (year % 5 == 0 && year*12 !== payments)   //Number every 5 years
      g.fillText(String(year), x, y-5)
} //close for

//Mark pmt amount along the right edge
g.textAligin = "right"                       //right-justify text
g.textBaseline = "middle"                     //center it vertically
var ticks = [monthly*payments, principal]     // 2 point that will be marked
var rightEdge = paymentToX(payments)          //X-coordinate of y axis
for (var i=0; i < ticks.length; i++) {        // For each of the two points
  var y = amountToY(ticks[i])                 //Compute Y position of tick
  g.fillRect(rightEdge-3, y-0.5, 3, 1)        //Draw the tick mark
  g.fillText(String(ticks[i].toFixed(0)),     //...and label it
            rightEdge-5, y)
}
}//close chart()
