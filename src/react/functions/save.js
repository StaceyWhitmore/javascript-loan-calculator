// Save user's input props in localStorage object
const save = function(amount, apr, years, zipcode) {

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
