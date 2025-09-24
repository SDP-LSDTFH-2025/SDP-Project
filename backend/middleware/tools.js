const { User } = require('../models');
const jwt = require('jsonwebtoken');


function generateID(length = 21) {
  let result = '';
  for (let i = 0; i < length; i++) {
    // Append a random digit (0–9)
    result += Math.floor(Math.random() * 10);
  }

  return result;
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function jaccardSimilarity(listA, listB){//assume list a and b have same length, and if a[0]!=0 then b[0] = a[0]
  let numerator = 0;
  let denominator = 0;
  for (let i=0; i<listA.length; i++){
    if (listA[i] == 0 && listB[i]!=0){//false negative
      denominator+= listB[i];
    }
    else if (listA[i]!=0 && listB != 0){//true positive
      numerator += listA[i];
      denominator += listA[i];
    }
    else if (listA[i] != 0 && listB[i]==0){//false positive
      denominator+= listA[i];
    }
    //skip true negative
  }
  return numerator/denominator
}

function recommendUsers(user, users,threshold){
  let recommendUsers = [];
  let weights = {role:2,institution:1,school:1,year_of_study:2,course:4}//define the weights// define the weights

  //initiate the target user data
  let listA = new Array(5);
  
  listA[0] = user.role? weights.role : 0;
  listA[1] = user.institution? weights.institution : 0;
  listA[2] = user.school? weights.school : 0;
  listA[3] = user.year_of_study? weights.year_of_study : 0;
  listA[4] = user.course? weights.course : 0;
  
  //initiate and calculate the jaccard of predicted user data
  let listB = new Array(5);
  for (let candidate in users){
    listB[0] = (user.role == candidate.role)? weights.role : 0;
    listB[1] = (user.institution == candidate.institution)? weights.institution : 0;
    listB[2] = (user.school == candidate.school)? weights.school : 0;
    listB[3] = (user.year_of_study == candidate.year_of_study)? weights.year_of_study : 0;
    listB[4] = (user.course == candidate.course)? weights.course : 0;

    if (jaccardSimilarity(listA,listB)>threshold){ // the candidate has surpassed the min threshold
      recommendUsers.push(candidate);
    }
  }
  return recommendUsers;
}

class errorClass{
    static errorRes(message,res,code=400) {
        res.status(code).json({response:message})
    }
    static serverError(res){
        res.status(500).json({response:'Internal server error'})
    }
    static insufficientInfo(res){
        res.status(422).json({response:'Insufficient info provided by client'})
    }
    static userNotFound(res){
        res.status(404).json({response:'User does not exist'})
    }
    static Token(res){
        res.status(401).json({response:'Invalid token'})
    }
}

class verifyToken{
  static fireBaseToken(token,id){
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id === id;
      } catch (err) {
        console.error("Invalid token:", err.message);
        return false;
      }
  }
}

module.exports = {generateID,isValidEmail,recommendUsers,errorClass,verifyToken};