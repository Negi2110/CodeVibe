"use client"
import { usePlayground } from "@/modules/playground/hooks/usePlayground";
import { useParams } from "next/navigation";
import React from "react";
import { useSonner } from "sonner";

const MainPLaygroundPage=()=>{
    const {id}=useParams<{id:string}>();
    const {playgroundData,templateData,isLoading,error,saveTemplateData}=usePlayground(id)
    console.log("Template data",templateData)
    console.log("Playground data",playgroundData)
    return (
        <div>
            Params:{id}
        </div>

    )
}

export default MainPLaygroundPage