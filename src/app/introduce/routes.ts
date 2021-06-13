import {Router} from "express"
import {body, param} from "express-validator"

import{
    writeIntroduce,
    getIntroduce,
    updateIntroduce,
} from "app/introduce/controllers"
import {validationResultChecker} from "middlewares"
import passport from "passport"

const router = Router()

const writeIntroduceMiddlewares = [
    passport.authenticate("jwt",{session :false}),
  
    body("content").notEmpty(),
    validationResultChecker,
]
const updateIntroduceMiddlewares = [
    passport.authenticate("jwt",{session: false}),
    validationResultChecker,
]

router.post("/", writeIntroduceMiddlewares, writeIntroduce)
router.get("/",getIntroduce)
router.patch("/",updateIntroduceMiddlewares,updateIntroduce)

export default router
