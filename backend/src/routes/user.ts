import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { jwt ,decode,verify,sign} from 'hono/jwt'
import { signInput,signinInput } from '@sibi_elwin/medium-zod'


const userRouter= new Hono<{
    Bindings:{
      DATABASE_URL:string,
      JWT_SECRET:string
    }
  }>()
userRouter.post("/signup",async (c)=>{
    const prisma=new PrismaClient({
     datasourceUrl: c.env.DATABASE_URL , 
    }).$extends(withAccelerate())
    const body=await c.req.json();
    const {success}=signInput.safeParse(body);
    if(!success){
      c.status(411)
      return c.json({
        message:"Input not correct"
      }) 
    }
    try{
     const user=await prisma.user.create({
       data:{
        name:body.name,
         email:body.email,
         password:body.password
       }
     
      })
      const token=await sign({id:user.id},c.env.JWT_SECRET)
    return c.json({
     jwt:token
    })
    }
    catch(err){
     c.status(400)
     return c.json({error:"user already exist"})
    }
    
   
   })
   userRouter.post("/signin",async (c)=>{
     const prisma=new PrismaClient({
       datasourceUrl: c.env.DATABASE_URL ,
   
     }).$extends(withAccelerate())
     const body=await c.req.json();
     const {success}= signinInput.safeParse(body);
     if(!success){
      c.status(411)
      return c.json({
        "error":"Wrong input format"
      })
     }
     const user=await prisma.user.findUnique({
       where:{
         email:body.email,
         password:body.password
       }
     })
     if (!user) {
           c.status(403);
           return c.json({ error: "user not found" });
       }
   
       const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
       return c.json({ jwt });
   
   })

   export default userRouter;