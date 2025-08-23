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

class errorClass{
    static errorRes(message,res) {
        res.status(400).json({response:message})
    }
    static serverError(res){
        res.status(500).json({response:'Internal server error'})
    }
    static insufficientInfo(res){
        res.status(400).json({response:'Insufficient info provided by client'})
    }
    static userNotFound(res){
        res.status(400).json({response:'User does not exist'})
    }
    static Token(res){
        res.status(400).json({response:'Invalid token'})
    }
}

module.exports = {generateID,isValidEmail,errorClass};