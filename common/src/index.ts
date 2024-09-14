
import z from "zod"


export const signInput=z.object({
    email:z.string().email(),
    password:z.string().min(6),
    name:z.string().optional()
  })

  export type signInput=z.infer<typeof signInput>;


  export const signinInput=z.object({
    email:z.string().email(),
    password:z.string().min(6)
  })
  
  export type signinInput=z.infer<typeof signinInput>;

  export const createBlog=z.object({
    title:z.string(),
    content:z.string(),
  })
 
  export const updateBlog=z.object({
    title:z.string(),
    content:z.string(),
    id:z.string()
  })
  export type updateBlog=z.infer<typeof updateBlog>;