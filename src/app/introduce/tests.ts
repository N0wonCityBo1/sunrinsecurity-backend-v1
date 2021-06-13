import assert from "assert"
import request from "supertest"
import mongoose from "mongoose"
import app from "app"
import { Introduce } from "app/introduce/models"
import { User } from "app/user/models"
import { createHashedPassword } from "utils/user"
import connectDB from "config/connectDB"
import { ErrorType } from "errors"
import { buildCheckFunction } from "express-validator"


const testData = [
    {
        content : "어서오세요"
    }
]


const createIntroduce = async function (body : object,token: string) {
    return await request(app)
    .post("/introduce")
    .set("Authorization","Bearer" + token)
    .send(body)
}

describe("Introduce",()=>{
    const username = "testaccount"
    const password = "testpassword"
    const content = "testcontent"
    let token =""
    let token2 = ""

    before(async function () {
       connectDB()
       
       await User.deleteMany({}, () => {})
       await Introduce.deleteMany({}, () => {})

       const hashedPassword = createHashedPassword(password)

       await User.create({
           username : username,
           password : hashedPassword,
           alias: "for testing purposes"
        })
        await User.create({
            username: username + "2",
            password : hashedPassword,
            alias :"for testing purposes"
        })
        const response = await request(app).post("/user/auth/token").send({
            username: username,
            password: password,
        })
        token = JSON.parse(response.text).token

        const response2 = await request(app)
            .post("/user/auth/token")
            .send({
                username: username + "2",
                password: password,
            })
        token2 = JSON.parse(response2.text).token
     })

     beforeEach(async function () {
        await Introduce.deleteMany({}, () => {})
    })

    describe("Write Introduce", function(){
        describe("Failure Cases",function(){
            it("Should return 401 unauthorized", async function(){
                await request(app)
                .post("/introduce")
                .send({
                    content: content
                })
                .expect(401)
            })
            it("No content, should return 400 with error response",async function ()  {
                const response = await request(app)
                .post("/introduce")
                .set("Authorization","Bearer" + token)
                .send({

                })
                .expect(400)
                const { errorType, details } = JSON.parse(response.text)
                assert.strictEqual(errorType, ErrorType.ValidationError)
                assert.strictEqual(details[0].param, "content")
            })

        })
        describe("Success Cases",function(){
            it("Proper Request",async function () {
                await request(app)
                .post("/introduce")
                .set("Authorization","Bearer" + token)
                .send({
                    content: content,
                })
                .expect(201)
            })

        })
    })
    describe("Get Introduce",async function () {
        it("Introduce shdould not be found",async function(){
            await  request(app).get("/introduce").send().expect(404)
        })
        it("Introduce should be found",async function () {
            const response = await request(app)
            .get('/introduce')
            .send()
            .expect(200) 
            const parsedResponse = JSON.parse(response.text)
            const responseContent = parsedResponse.content
            assert.strictEqual(responseContent, testData[0].content)
        })
    })
    describe("Update Notice" ,async function () {
        describe("Failure Cases",function (){
            it("Introduce shdould not be found",async function () {
                await request(app)
                    .patch("/introduce/wrong_id")
                    .set("Authorization","Bearer"+token)
                    .send()
                    .expect(404)
            })
            it("Should return 401 Unauthorized", async function () {
                const id = JSON.parse(
                    (await createIntroduce(testData[0], token)).text
                )._id
                await request(app).patch(`/introduce/${id}`).expect(401)
            })
            it("Should return 403 Forbidden", async function () {
                const id = JSON.parse(
                    (await createIntroduce(testData[0], token)).text
                    )._id
                await request(app)
                    .patch(`/introduce/${id}`)
                    .set("Authorization", "Bearer " + token2)
                    .expect(403)
            })
            
        })
        describe("Success Cases",function (){
            it("Updating content",async function () {
                const id =JSON.parse(
                    (await createIntroduce(testData[0],token)).text
                )._id
                const response = await request(app)
                    .patch(`/introduce/${id}`)
                    .set("Authorization", "Bearer " + token)
                    .send({
                        content :"<p> 수정된 내용입니다.</p>"
                    })
                    .expect(200)
                    const data = JSON.parse(response.text)
                    assert.strictEqual(data.content,"<p> 수정된 내용입니다.</p>" )
            })
        })
    })
    after(async () =>{
        await Introduce.deleteMany({},() =>{})
        await User.deleteMany({},() =>{})
        await mongoose.disconnect()
    })
})