import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import {verify } from "hono/jwt"

import { createBlog,updateBlog } from "@sibi_elwin/medium-zod";
const blogRouter= new Hono<{
    Bindings:{
      DATABASE_URL:string,
      JWT_SECRET:string
    },
    Variables:{
        jwtPayLoad:string
    }
  }>()



blogRouter.use('/*', async (c, next) => {
  
    const header =c.req.header("authorization") || "";
    const token=header.split(" ")[1];
    const response=await verify(token,c.env.JWT_SECRET);
    if(response.id){

        c.set("jwtPayload",response.id);
    await next()
    }
    else{
      c.status(403)
      return c.json({error:"unauthorized"})
    }
  })
  blogRouter.put("/",async (c)=>{
    const prisma=new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL , 
       }).$extends(withAccelerate())

       const body=await c.req.json();
       const {success}=updateBlog.safeParse(body);
       if(!success){
        c.status(411)
        return c.json({
          "Error":"Invalid Blog"
        })
       }
       const blog=await prisma.post.update({
        where:{
            id:body.id
        },
        data:{
            content:body.content,
            title:body.title
        }
       })
       
       return c.json({
        id:blog.id
           })
    
    
  })

  blogRouter.post("/",async (c)=>{
    const prisma=new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL , 
       }).$extends(withAccelerate())
       const body=await c.req.json();
       const {success}=createBlog.safeParse(body);
       if(!success){
        c.status(411)
        return c.json({
          "Error":"Invalid Blog"
        })
       }
       const blog =await prisma.post.create({
        data:{title: body.title,
            content: body.content,
            authorId:c.get("jwtPayload")
        }
       })

       return c.json({
    id:blog.id
       })

  })
  blogRouter.get("/bulk",async (c)=>{
    const prisma=new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL ,
    }).$extends(withAccelerate())
        const blogs=await prisma.post.findMany({
          select:{
            id:true,
            title:true,
            content:true,
            author:{
              select:{
                name:true
              }
            }
          }
  });
        return c.json({
            blogs
        });
      })
  blogRouter.get("/:id", async (c) => {
    const prisma=new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL , 
       }).$extends(withAccelerate())
       
       const id=c.req.param("id");
       try{
        const post = await prisma.post.findUnique({
            where: {
                id
            },
            select:{
              id:true,
              title:true,
              content:true,
              
              author:{
                select:{
                  name:true
                }
              }
            }
        });
    
        return c.json({post:post});
       }
       catch(err){
        return c.json({err:"No such User"})
       }
  })
  

  

export default blogRouter;