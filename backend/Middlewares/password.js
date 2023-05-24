const PasswordValidator = require("password-validator")

const passwordSchema= new PasswordValidator();



passwordSchema
.is().min(5)                                    // Minimum 5 caractères
.is().max(25)                                  // Maximum  25 caractères
.has().uppercase()                              // Doit avoir des majucsules
.has().lowercase()                              // Doit avoir des minuscules
.has().digits(2)                                // Doit avoir 2 chiffres
.has().not().spaces()                           // Interdiction d'espaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Mot de passe blacklist

module.exports= (req,res,next) => {
    if(passwordSchema.validate(req.body.password)){
        next();
    }else{
        return res.status(400).json({error: "Le mot de passe est trop simple: Minimum 5 caractères , majuscules et minuscules , doit avoir 2 chiffres"})
    }
}