// src/controllers/userController.ts
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

// ==================== GET USER PROFILE ====================
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId; // From JWT middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Get user from member_registrations table
    const { data, error } = await supabase
      .from("member_registrations")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Transform to user profile format
    const userProfile = {
      id: data.id,
      member_id: data.proposer_membership_id,
      name: data.proposer_name,
      email: data.email_id,
      phone: data.mobile_number,
      designation: "Member",
      blood_group: data.blood_group,
      date_of_birth: data.date_of_birth,
      date_of_wedding: data.date_of_wedding,
      spouse_name: data.spouse_name,
      spouse_dob: data.spouse_dob,
      spouse_blood_group: data.spouse_blood_group,
      business_name: data.business_name,
      business_address: data.business_address,
      position: data.position,
      residential_address: data.residential_address,
      social_activities: data.social_activities,
      hobbies: data.hobbies,
      status: data.status,
      created_at: data.created_at,
    };

    return res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

// ==================== UPDATE USER PROFILE ====================
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      name,
      email,
      designation,
      blood_group,
      date_of_birth,
      residential_address,
      business_name,
      business_address,
      position,
    } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }
    }

    // Check if email is already used by another user
    if (email) {
      const { data: existingUser } = await supabase
        .from("member_registrations")
        .select("id")
        .eq("email_id", email)
        .neq("id", userId)
        .single();

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use by another user",
        });
      }
    }

    // Prepare update data (map to member_registrations column names)
    const updateData: any = {};

    if (name !== undefined) updateData.proposer_name = name;
    if (email !== undefined) updateData.email_id = email;
    if (blood_group !== undefined) updateData.blood_group = blood_group;
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
    if (residential_address !== undefined)
      updateData.residential_address = residential_address;
    if (business_name !== undefined) updateData.business_name = business_name;
    if (business_address !== undefined)
      updateData.business_address = business_address;
    if (position !== undefined) updateData.position = position;

    // Update user in member_registrations table
    const { data, error } = await supabase
      .from("member_registrations")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Update user error:", error);
      return res.status(400).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    }

    // Transform back to user profile format
    const userProfile = {
      id: data.id,
      member_id: data.proposer_membership_id,
      name: data.proposer_name,
      email: data.email_id,
      phone: data.mobile_number,
      designation: "Member",
      blood_group: data.blood_group,
      date_of_birth: data.date_of_birth,
      residential_address: data.residential_address,
      business_name: data.business_name,
      business_address: data.business_address,
      position: data.position,
      created_at: data.created_at,
    };

    console.log(`✅ Profile updated for user: ${data.proposer_name}`);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userProfile,
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// ==================== GET USER BY ID (Admin) ====================
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("member_registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Transform to user profile format
    const userProfile = {
      id: data.id,
      member_id: data.proposer_membership_id,
      name: data.proposer_name,
      email: data.email_id,
      phone: data.mobile_number,
      designation: "Member",
      blood_group: data.blood_group,
      date_of_birth: data.date_of_birth,
      residential_address: data.residential_address,
      business_name: data.business_name,
      created_at: data.created_at,
    };

    return res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};
// ```

// ---

// # 🧪 **Test All APIs**

// ## **1. Get All Members**

// **GET** `http://localhost:3000/api/members`

// **Headers:**
// ```
// Authorization: Bearer YOUR_TOKEN
