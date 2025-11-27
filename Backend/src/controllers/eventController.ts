// src/controllers/eventController.ts
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get events error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};
