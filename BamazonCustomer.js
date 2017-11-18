
// Require prompt node package 
var prompt = require('prompt');

// Require mySQL node package
var mysql = require('mysql');



// Link to mySQL Database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username
    password: "Oxcowrocks1", //Your password
    database: "Bamazon"
});

// Connect to Database
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});



// Display All Items inside Database and sell an item to customer
connection.query('SELECT * FROM Products', function(err, res){
  
  // Error Handler
  if(err) throw err;


  // Show User message
  console.log('Check out our selection...\n');

  // Set up table header
  console.log('  ID  |      Product Name      |  Department Name  |   Price  | In Stock');
  console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ')
  
  for(var i = 0; i < res.length; i++){

     var itemID = res[i].ItemID + ''; 
     var productName = res[i].ProductName + ''; 
     var departmentName = res[i].DepartmentName + ''; 
     var price = '$' + res[i].Price.toFixed(2) + ''; 
     var quantity = res[i].StockQuantity + ''; 

    console.log(itemID + '|' + productName + '|' + departmentName + '|' + price + '|    ' + quantity);
  }

  // =================================================================================================

  // After the table is shown, ask the user to buy something
  prompt.start();

  // Ask for Item ID
  console.log('\nWhich item do you want to buy?');
  prompt.get(['buyItemID'], function (err, result) {
    
    // Show Item ID selected
    var buyItemID = result.buyItemID;
    console.log('You selected Item # ' + buyItemID + '.');

    console.log('\nHow many do you wish to buy?')
    prompt.get(['buyItemQuantity'], function (err, result) {

      // Show quantity selected
      var buyItemQuantity = result.buyItemQuantity;
      console.log('You selected to buy ' + buyItemQuantity + ' of these.');

      // Once the customer has placed the order, check if store has enough of the product to meet the request
      connection.query('SELECT StockQuantity FROM Products WHERE ?', [{ItemID: buyItemID}], function(err, res){
        if(err) throw err; // Error Handler
        if(res[0] == undefined){
          console.log('Sorry... We found no items with Item ID "' +  buyItemID + '"');
          connection.end(); // end the script/connection
        }
        else{
          var bamazonQuantity = res[0].StockQuantity;
          // Sufficient inventory
          if(bamazonQuantity >= buyItemQuantity){

            // Update mySQL database with reduced inventory
            var newInventory = parseInt(bamazonQuantity) - parseInt(buyItemQuantity); // ensure we have integers for subtraction & database
            connection.query('UPDATE Products SET ? WHERE ?', [{StockQuantity: newInventory}, {ItemID: buyItemID}], function(err, res){
              if(err) throw err; 
            }); 


            // Show customer their purchase total (need to query the price info from database)
            var customerTotal;
            connection.query('SELECT Price FROM Products WHERE ?', [{ItemID: buyItemID}], function(err, res){
              
              var buyItemPrice = res[0].Price;
              customerTotal = buyItemQuantity*buyItemPrice.toFixed(2);

              console.log('\nYour total is $' + customerTotal + '.');

              

                  }); 
          }
          // Insufficient inventory
          else{
            console.log('Sorry... We only have ' +  bamazonQuantity + ' of those items. Order cancelled.');
            connection.end(); // end the script/connection
          }
        }

      }); 

    }); 

  }); 

}); 

