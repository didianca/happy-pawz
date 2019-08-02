# Happy-Pawz

**Description**:  A **_REST API_** designed to support a pet daycare website which can offer different services such as: housing and grooming and if needed veterinary care. It manipulates data such as user and pet information, deals with management such as rooms, employees and rental services.

The API was build in Node.js using the Express.js framework, MongoDB for data manipulation and Jest.js for automated (integration and unit ) testing.

# [test results] (/TEST_RESULTS/index.html)

##### In order to start the API you need to:
1. go to the console and npm install;
2. for data base: set up mongoDB on your computer(mongodb.com -> server -> download the MSI) and install MongoDB Compass(UI) for easily viewing and manipulating data (necessary for setting up admin privileges);
3. for creating unique authentication tokens: json web tokens : open terminal and ---set hp_jwtPrivateKey= '*insert whatever private key you want*'--- as an environment variable (naming convention: '*hp*' stands for the project's name -HappyPawz- to avoid mixing different environment variables from different projects);
4. go to index.js: everything is implemented here and u can trace back all the way to each endpoint by following the imports;
5. to start the server: in terminal use '*node index.js*' or for constantly modifying code and have the server restart automatically after each change use : '*nodemon*';
#
#### How it works:

#### **Step 1**:       (*Sign Up*)
* **a**. in Insomnia/Postman go to '*http://localhost:5000/api/users*' and make a new POST request with a JSON object as it's body in order to register new user.
* **b**. assign the '*name*','*email*','*password*'and '*phone*'  properties for the user object.
* **c**. if there are no errors the body of the response will return the newly created object(!! except secret info such as id or password), else it will return the proper error message.
* **d**. in oder to proceed, go to the Header of the response and get the '*x-auth-token*' value.
* **e**. to access the logged in user go to '*http://localhost:5000/api/users/me*', and make a new GET request then go to the Header section and add a new property '*x-auth-token*' with the value provided previously(see 1.d.).
> *IMPORTANT:* for working with operations that require admin privileges go to mongoDB Compass and update a certain user by setting the isAdmin property (which defaults to false) to true.
> *IMPORTANT:* certain operations require authentication,authorization  or both. Make sure to get the auth-token from the header of the response and use it in future steps.

#### **Step 2**:       (*Login*)
* **a**. in Insomnia/Postman go to '*http://localhost:5000/api/auth*' and make a new POST request with a JSON object as it's body in order to login.
* **b**. assign the '*email*',and '*password*' properties to be compared
* **c**. if there are no errors, the body of the response will return the compared user object (!! except secret info such as id or password), else it will return the proper error message.
>*IMPORTANT:* certain operations require authentication,authorization  or both. Make sure to get the auth-token from the header of the response and use it in future steps.

#### **Step 3**:       (*roles*)
* **a*. in Insomnia/Postman go to '*http://localhost:5000/api/roles*' and make a GET request. This will return a list of aLl the registered roles.
* **b**. by using the same URL make a new POST request with a JSON object as it's body.
* **c**. assign a '*title*' property for the role object (!**_Important_**: the roles "veterinarian","lawyer","accountant" and "medical assistant" have special qualification rates. Try using them to see results.)
* **d**. if there are no errors the body of the response will return the newly created object(! mind the *id* property), else it will return the proper error message.
* **e**. after this is done, you can try any CRUD operation on the role objects by accessing '*http://localhost:5000/api/roles/:id*' (see 3.d. for obtaining the id,get any object id in the list of roles by following 3.a, or see MongoDB Compass for list of objects).
* **f**. make sure to *create* a maid and a caretaker roles for next steps.(in a real world application this would be done only once)

#### **Step 4**:      (*employees*)
* **a**. in Insomnia/Postman go to '*http://localhost:5000/api/employees*' and make a GET request. This will return a list of aLl the registered employees.
* **b**. by using the same URL make a new POST request with a JSON object as it's body.
* **c**. assign the '*name*','*roleId*', and '*phone*'  properties for the employee object(!**_Important_**: the roleId must be a valid object id from the list of roles created previously.This is for automatically calculating the salary).
* **d**. if there are no errors the body of the response will return the newly created object(! mind the *id* property), else it will return the proper error message.
* **e**. after this is done, you can try any CRUD operation on the employee objects by accessing '*http://localhost:5000/api/employees/:id*' (see 4.d. for obtaining the id else get any object id in the list of employees by following 4.a).
* **f**. make sure to *create* an employee with the maid role and one with the caretaker role

#### **Step 5**:       (*rooms*)
> (!*Important*: for the room object to be created you will need a maid employee and a caretaker employee previously created.!)
* **a**. in Insomnia/Postman go to '*http://localhost:5000/api/rooms*' and make a GET request. This will return a list of aLl the registered rooms.
* **b**. by using the same URL make a new POST request with a JSON object as it's body.
* **c**. assign the '*size*','*level*','*caretaker*'and '*maid*'  properties for the room object.
* **d**. the '*size*' property will be either multiple or single
* **e**. the '*level*' property will be either 0 or 1
* **f**. the '*caretaker*'and '*maid*'  property will be represented by an employee's id. (see 4.a.).
* **g**. if there are no errors the body of the response will return the newly created object(! mind the *id* property), else it will return the proper error message.
* **h**. after this is done, you can try any CRUD operation on the room objects by accessing '*http://localhost:5000/api/rooms/:id*' (see 5.g. for obtaining the id else get any object id in the list of rooms by following 5.a).

#### **Step 6**:       (*owner*)
> (!*Important*: for the owner object to be created you will need an user id previously created!)
* **a**. in Insomnia/Postman go to '*http://localhost:5000/api/owners*' and make a GET request. This will return a list of aLl the registered pets.
* **b**. by using the same URL make a new POST request with a JSON object as it's body.
* **c**. assign the '*user*' and '*address*' properties to the owner object.
* **d**. the '*user*'  property will be represented by a user's id. (see 1.e. or just get one from the list provided in MongoDB Compass)
* **e**. if there are no errors the body of the response will return the newly created object(! mind the *id* property), else it will return the proper error message.
* **h**. after this is done, you can try any CRUD operation on the pet objects by accessing '*http://localhost:5000/api/pets/:id*' (see 6.e. for obtaining the id else get any object id in the list of owners by following 6.a.).
> (*IMPORTANT:* in order to create new pets you need to first create an owner)

#### **Step 7**:       (*pets*)
>(!*Important*: for the pet object to be created you will need an owner id previously created!)
* **a**. in Insomnia/Postman go to '*http://localhost:5000/api/pets*' and make a GET request. This will return a list of all the registered pets.
* **b**. by using the same URL make a new POST request with a JSON object as it's body.
* **c**. assign the '*name*','*microChip*','*ownerInfo*','*petRace*','*breed*','*birthYear*','*castrated*','*petColor*','*sex*'and '*healthy*' properties to the pet object making sure to assign an individual '*microChip*' property to each pet.
* **d**. the '*ownerInfo*'  property will be represented by an owner's id (see 6.e. or just get one from the list provided in MongoDB Compass).
* **e**. if there are no errors the body of the response will return the newly created object(! mind the *id* property), else it will return the proper error message.
* **h**. after this is done, you can try any CRUD operation on the pet objects by accessing '*http://localhost:5000/api/pets/:id*' (see 7.e. for obtaining the id else get any object id in the list of pets by following 7.a.).

#### **Step 8**:       (*rentals*)
>(!*Important*: for the rental object to be created you will need an owner id, a room id and a pet id previously created!)
* **a**. in Insomnia/Postman go to '*http://localhost:5000/api/rentals*' and make a new POST request with a JSON object as it's body in order to rent a room.
* **b**. assign the '*ownerId*','*roomId*' and '*petId*' properties to the rental object.
* **c**. the '*ownerId*' property will be represented by an owner's id.(see 6.e. or get one from MongoDb Compass)
* **d**. the '*roomId*' property will be represented by a room's id.(see 5.g. or get one from MongoDb Compass)
* **e**. the '*petId*' property will be represented by a pet's id.(see 7.e. or get one from MongoDb Compass)
* **f**. if there are no errors the body of the response will return the newly created object(! mind the *id* property), else it will return the proper error message.

#### **Step 9**:       (*checkout*)
> (!*Important*: for the checkout you will need an owner id, a room id and a pet id previously used to create a rental object)
* **a**. in Insomnia/Postman go to '*http://localhost:5000/api/checkout*' and make a new POST request with a JSON object as it's body in order to checkout and existing rental.
* **b**. assign the '*ownerId*','*roomId*' and '*petId*' properties (used previously to create a rental object) to the object in the body of the request.
* **f**. if there are no errors the body of the response will return the modified rental object(! mind the *id* property), else it will return the proper error message.
