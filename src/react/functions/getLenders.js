/****************GETLENDERS: getLenders() function***********************/
//pass the user's input to a server-side script which can (in theory) return
//a list of local lenders interested in making loans. This example does not acutally
//include an implementation of such a lender-finding service. But if such a service
//did exist this fn would find it

const getLenders = function(amount, apr, years, zipcode) {

  //If the brownwer doesn't support XMLHttpRequest obejects, then do nothing (ie. `return` with nothing)
  if (!window.XMLHttpRequest) return

  //Find the element in which to display the list of lenders
  const ad = document.getElementById('lenders')
  if (!ad) return      //Quit if there is no element to output it into

  //Encode the user's input as query parameters in a URL
  let url = "getLenders.php"  +  //service url plus
  "?amt" + encodeURIComponent(amount) + // user data in query string
  "?apr" + encodeURIComponent(apr) +
  "?yrs" + encodeURIComponent(years) +
  "?zip" + encodeURIComponent(zipcode)

  //Fetch the contents of that URL using the XMLHttpRequest obeject
  let req = new XMLHttpRequest() //Begin a new XMLHttpRequest
  req.open("GET", url)           //An HTTP GET request for the url
  req.send(null)                 //Send the request with no body. (Blocked by CORS policy)

  //Prior to returning, register and event handler function that will be called
  //at some time later when the HTTP server's response arrives. This is a common
  //type of asynchrounous programming in client-side JS
  req.onreadystatechange = function() {
    if (req.readystate == 4 && req.status == 200) {
      // If we get to this point, we have a complete valid HTTP response
      let response = req.responseText //Http response as a string
      let lenders = JSON.parse(response) // Parese it to a JS array

      // Convert the array of lender objects to a string of HTML
      let list = ""
      for(let i = 0; i < lenders.length; i++) {
        list += "<li></li><a href='" + lenders[i].url +"'>" +
        lenders[i].name + "</a>"
      }

      //Display the HTML in the element from above
      ad.innerHTML = "<ul>" + list + "</ul>"
    }
  }
} //close getLenders ******************************
