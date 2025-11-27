// src/controllers/memberController.ts
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

// ==================== GET ALL MEMBERS ====================
export const getAllMembers = async (req: Request, res: Response) => {
  try {
    // Get all members from member_registrations table
    const { data, error } = await supabase
      .from("member_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform data to match member format
    const members = data.map((reg) => ({
      id: reg.id,
      member_id: reg.proposer_membership_id,
      name: reg.proposer_name,
      designation: "Member", // Default
      classification: reg.business_name ? "Business" : "Professional",
      phone: reg.mobile_number,
      email: reg.email_id,
      blood_group: reg.blood_group,
      date_of_birth: reg.date_of_birth,
      age: reg.date_of_birth
        ? new Date().getFullYear() - new Date(reg.date_of_birth).getFullYear()
        : null,
      is_vip: false, // Default
      status: reg.status,
      created_at: reg.created_at,
    }));

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.error("Get members error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch members",
    });
  }
};

// ==================== GET MEMBER BY ID ====================
// export const getMemberById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const { data, error } = await supabase
//       .from("member_registrations")
//       .select("*")
//       .eq("id", id)
//       .single();

//     if (error || !data) {
//       return res.status(404).json({
//         success: false,
//         message: "Member not found",
//       });
//     }

//     // Transform to member format
//     const member = {
//       id: data.id,
//       member_id: data.proposer_membership_id,
//       name: data.proposer_name,
//       designation: "Member",
//       classification: data.business_name ? "Business" : "Professional",
//       phone: data.mobile_number,
//       email: data.email_id,
//       blood_group: data.blood_group,
//       date_of_birth: data.date_of_birth,
//       spouse_name: data.spouse_name,
//       business_name: data.business_name,
//       business_address: data.business_address,
//       position: data.position,
//       residential_address: data.residential_address,
//       status: data.status,
//       created_at: data.created_at,
//     };

//     return res.status(200).json({
//       success: true,
//       data: member,
//     });
//   }
// ✅ NEW: Get full member details by ID
export const getMemberById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
    }

    const { data, error } = await supabase
      .from("member_registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching member details:", error);
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Return complete member registration data
    return res.status(200).json({
      success: true,
      data: {
        // Basic Info
        id: data.id,
        member_id: data.proposer_membership_id,

        // Personal Information
        proposer_name: data.proposer_name,
        proposer_membership_id: data.proposer_membership_id,
        proposed_member_name: data.proposed_member_name,
        name: data.proposed_member_name || data.proposer_name,
        mobile_number: data.mobile_number,
        phone: data.mobile_number,
        email_id: data.email_id,
        email: data.email_id,
        date_of_birth: data.date_of_birth,
        blood_group: data.blood_group,
        date_of_wedding: data.date_of_wedding,

        // Family Information
        spouse_name: data.spouse_name,
        spouse_dob: data.spouse_dob,
        spouse_blood_group: data.spouse_blood_group,
        child1_name: data.child1_name,
        child1_age: data.child1_age,

        // Business Information
        business_name: data.business_name,
        business_address: data.business_address,
        position: data.position,
        principal_activity: data.principal_activity,
        residential_address: data.residential_address,
        member_of_chamber: data.member_of_chamber,

        // Additional Details
        social_activities: data.social_activities,
        hobbies: data.hobbies,
        rotary_interests: data.rotary_interests,

        // Submission Details
        special_features: data.special_features,
        known_duration: data.known_duration,
        terms_accepted: data.terms_accepted,
        declaration_name: data.declaration_name,
        declaration_place: data.declaration_place,
        declaration_datetime: data.declaration_datetime,
        status: data.status,

        // Display
        designation: "Member",
        classification: data.business_name ? "Business" : "Professional",
        image_url: data.image_url || null,

        // Timestamps
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    });
  } catch (error) {
    console.error("Get member error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch member",
    });
  }
};

// ==================== SEARCH MEMBERS ====================
export const searchMembers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    let supabaseQuery = supabase.from("member_registrations").select("*");

    // Search by name, member_id, or email
    if (query) {
      supabaseQuery = supabaseQuery.or(
        `proposer_name.ilike.%${query}%,proposer_membership_id.ilike.%${query}%,email_id.ilike.%${query}%`
      );
    }

    const { data, error } = await supabaseQuery.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    // Transform data to match member format
    const members = data.map((reg) => ({
      id: reg.id,
      member_id: reg.proposer_membership_id,
      name: reg.proposer_name,
      designation: "Member",
      classification: reg.business_name ? "Business" : "Professional",
      phone: reg.mobile_number,
      email: reg.email_id,
      blood_group: reg.blood_group,
      date_of_birth: reg.date_of_birth,
      is_vip: false,
      status: reg.status,
      created_at: reg.created_at,
    }));

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.error("Search members error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search members",
    });
  }
};
