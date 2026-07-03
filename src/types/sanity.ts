export interface SanityImage {

  _type:"image"

  asset:{
    _ref:string
  }

}


export interface Page {

  _id:string

  title:string

  slug:{
    current:string
  }

  sections:Block[]

}


export type Block =

HeroBlock |
TextBlock |
GalleryBlock |
VideoBlock |
CTABlock |
ContactBlock



export interface HeroBlock {

  _type:"hero"

  title:string

  image?:SanityImage

  mediaType:
  "image" |
  "video"

  overlay:number

  height:string

  alignment:string

}



export interface TextBlock {

  _type:"textBlock"

  content:any[]

}



export interface GalleryBlock {

  _type:"gallery"

  title:string

  images:SanityImage[]

}



export interface VideoBlock {

  _type:"videoBlock"

  title:string

  url:string

}



export interface CTABlock {

  _type:"ctaBlock"

  title:string

}



export interface ContactBlock {

  _type:"contactBlock"

  title:string

}