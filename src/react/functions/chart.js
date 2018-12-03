/****************CHART: chart() function****************/
//Chart monthly loan balance, interest and equity in an HTML <canavas> element
//If called with no args, then just erase the chart that was drawn previously
const chart = function(principal, interest, monthly, payments) {
  const graph = document.getElementById("graph") //get the <canvas> tag
  graph.width = graph.width //Clears and resets the <canvas> element

  //If called with no args OR if this current browser doesn't support graphics
  //inside a <canvas> element then just return
if(arguments.length == 0 || !graph.getContext) return;

//Get the context object for the canavas
let g = graph.getContext("2d") //All drawing is done with this object
let width = graph.width, height = graph.height //get canvas size (, so `let` only needs to be typed once)

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
let equity = 0
g.beginPath()                           //Begin a new shapte
g.moveTo(paymentToX(0), amountToY(0))   //Start at lower-left
for(let p = 1; p <= payments; p++) {
  // for each pmt, figure out how much is interest
  let thisMonthsInterest = (principal-equity)*interest
  equity += (monthly - thisMonthsInterest)   //The rest goes to Equity
  g.lineTo(paymentToX(p), amountToY(equity)) //line to this point
} //close for
g.lineTo(paymentToX(payments), amountToY(0)) //line back to X-axis
g.closePath()                                //And back to start point
g.fillStyle = "green"                      //Now use green color to paint..
g.fill()                                     //...and fill the area under the curve
g.fillText("Total Equity", 20, 35)           //...and also label it in green

//Loop again, just as above, but chart loan balance as a thick black line
let bal = principal
g.beginPath()
g.moveTo(paymentToX(0), amountToY(bal))
for(let p = 1; p <= payments; p++) {
  let thisMonthsInterest = bal * interest
  bal -= (monthly - thisMonthsInterest)      //the rest goes to equity
  g.lineTo(paymentToX(p), amountToY(bal))    //draw line to this point

}//close for
g.lineWidth = 3                               //Use a thick line
g.stroke()                                    //draw the balance curve
g.fillStyle = "black"                         //switch to black text
g.fillText("Loan Balance", 20, 50)            //Legend entry

//Now make yearly tick marks and year numbers on X-axis
g.textAlign = "center"                        //Center text over ticks
let y = amountToY(0)                           //Y coordinate of X-axis
for(let year=1; year*12 <= payments; year++) { //For each year ...
  let x = paymentToX(year*12)                  //compute tick position
  g.fillRect(x-0.5, y-3, 1, 3)                 //Draw the tick
  if (year == 1) g.fillText("year", x, y-5)    //Label the axis
  if (year % 5 == 0 && year*12 !== payments)   //Number every 5 years
      g.fillText(String(year), x, y-5)
} //close for

//Mark pmt amount along the right edge
g.textAligin = "right"                       //right-justify text
g.textBaseline = "middle"                     //center it vertically
let ticks = [monthly*payments, principal]     // 2 point that will be marked
let rightEdge = paymentToX(payments)          //X-coordinate of y axis
for (let i=0; i < ticks.length; i++) {        // For each of the two points
  let y = amountToY(ticks[i])                 //Compute Y position of tick
  g.fillRect(rightEdge-3, y-0.5, 3, 1)        //Draw the tick mark
  g.fillText(String(ticks[i].toFixed(0)),     //...and label it
            rightEdge-5, y)
}
}//close chart()
