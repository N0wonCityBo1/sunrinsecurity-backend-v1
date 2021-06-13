import {Schema,model,Document} from "mongoose"

interface IntroduceModel {
    writer: string
    
    content: string
}

interface IntroduceModelDocument extends Document,IntroduceModel{}

const introduceSchema: Schema<IntroduceModelDocument> = new Schema(
    {
       
        content: { type: String, required: true },
    },
    {timestamps:true}
)

introduceSchema.index({username :1})

const Introduce = model<IntroduceModelDocument>("Introduce",introduceSchema)

export{
    IntroduceModel,
    IntroduceModelDocument as IntroduceModelSchema,
    Introduce,
}