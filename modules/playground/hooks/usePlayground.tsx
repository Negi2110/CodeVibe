import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import type { TemplateFolder } from "../lib/path-to-json";
import { getPlaygroundByid, SaveUpdatedCode } from "../actions";

interface PLaygroundData {
    id: string;
    name?: string,
    [key: string]: any
}

interface usePlaygroundReturn {
    playgroundData: PLaygroundData | null;
    templateData: TemplateFolder | null;
    isLoading: boolean;
    error: string | null;
    loadPlayground: () => Promise<void>;
    saveTemplateData: (data: TemplateFolder) => Promise<void>;
}

export const usePlayground = (id: string): usePlaygroundReturn => {
    const [playgroundData, setPlaygroundData] = useState<PLaygroundData | null>(null);
    const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPlayground = useCallback(async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            setError(null);

            const data = await getPlaygroundByid(id);

            //   @ts-ignore
            setPlaygroundData(data);
            const rawContent = data?.templateFiles?.[0]?.content;

            if (typeof rawContent === "string") {
                const parsedContent = JSON.parse(rawContent);
                setTemplateData(parsedContent);
                toast.success("playground loaded successfully");
                return;
            }

            //   load template from api if not in saved content

            const res = await fetch(`/api/template/${id}`);

            if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);

            const templateRes = await res.json();

            if (templateRes.templateJson && Array.isArray(templateRes.templateJson)) {
                setTemplateData({
                    folderName: "Root",
                    items: templateRes.templateJson,
                });
            } else {
                setTemplateData(
                    templateRes.templateJson || {
                        folderName: "Root",
                        items: [],
                    }
                );
            }
            toast.success("Template loaded successfully");
        } catch (error) {
            console.error("Error loading playground:", error);
            setError("Failed to load playground data");
            toast.error("Failed to load playground data");
        } finally {
            setIsLoading(false);
        }
    }, [id]);


    const saveTemplateData = useCallback(async (data: TemplateFolder) => {
        try {
            await SaveUpdatedCode(id, data);
            setTemplateData(data);
            toast.success("Changes saved successfully");
        } catch (error) {
            console.error("Error saving template data:", error);
            toast.error("Failed to save changes");
            throw error;
        }
    }, [id])
    useEffect(() => {
        loadPlayground()
    }, [loadPlayground])

    return {
        playgroundData,
        templateData,
        isLoading,
        error,
        loadPlayground,
        saveTemplateData,
    };

};


