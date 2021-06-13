import {Request,Response} from 'express'
import {Introduce} from "app/introduce/models";
import {UserModel} from "app/user/models";
import {isValidObjectId} from "mongoose";

const writeIntroduce = async (req:Request,res:Response) =>{
    const currentUser: UserModel | any = req.user
    const {
      
        content,
    } =req.body

    const introduceDocument = {
        writer : currentUser.username,
      
        content :content,

    }
    try {
        const introduce = await Introduce.create(introduceDocument)
        return res.status(201).send(introduce)
    } catch (err){
        console.log(err)
        return res.status(500).send()
    }
}

const getIntroduce =async (req: Request,res: Response) =>{

    const isIntroduceExists = await Introduce.exists({})
    if (!isIntroduceExists) {
        return res.status(404).send()
    }
    const introduce =  await Introduce.find({})

    return res.send({introduce : introduce[0]})

}

const updateIntroduce =async (req: Request,res: Response) =>{
    const currentUser: UserModel | any = req.user
    

    const introduceID = req.params["id"]
    if (!isValidObjectId(introduceID)){
        return res.status(404).send()
    }
    const isIntroduceExists = await Introduce.exists({_id: introduceID})
    if(!isIntroduceExists){
        return res.status(404).send()
    }
    let introduce = await Introduce.findById(introduceID)

    if (introduce?.writer !== currentUser.username) {
        return res.status(403).send()
    }

    for(let key in req.body){
        if(introduce?.get(key) && introduce?.get(key) !== req.body[key]){
            introduce.set(key,req.body[key])
        }
    }
    await introduce?.save()

    return res.send(introduce)

}



export {writeIntroduce,updateIntroduce,getIntroduce}
