const calculate = function() {
  const amount = document.getElementById('amount')
  const apr = document.getElementById('apr')
  const years = document.getElementById('years')
  const zipcode = document.getElementById('zipcode')
  const payment = document.getElementById('payment')
  const total = document.getElementById('total')
  const totalinterest = document.getElementById('totalinterest')

  //Get the inputs from their respective elements and assume they are all valid
  //(this is a basic interest app and so far has no input validation)
  //convert interest from percentage to decimal, and convert from an annual rate
  //tp a monthly rate.
  let principal = parseFloat(amount.value);
  let interest = parseFloat(apr.value) / 100 / 12;
  let payments = parseFloat(years.value) * 12;

  //compute the monthly pmt figure
  let x = Math.pow(1 + interest, payments) //(1 + interest) ^number of payments (e.g. 12)
  let monthly = (principal*x*interest)/(x-1)

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
