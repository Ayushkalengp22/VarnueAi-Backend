// // src/controllers/authController.ts
// import { Request, Response } from "express";
// import { supabase } from "../config/supabase";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// // Temporary OTP storage (In production, use Redis or database)
// const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// export const sendOTP = async (req: Request, res: Response) => {
//   try {
//     const { membership_id, phone } = req.body;

//     // Validate input
//     if (!membership_id || !phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Membership ID and phone number are required",
//       });
//     }

//     // Check if user exists
//     const { data: user, error } = await supabase
//       .from("users")
//       .select("*")
//       .eq("member_id", membership_id)
//       .eq("phone", phone)
//       .single();

//     if (error || !user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found with provided credentials",
//       });
//     }

//     // Generate 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

//     // Store OTP (In production, send via SMS service)
//     otpStore.set(phone, { otp, expiresAt });

//     console.log(`📱 OTP for ${phone}: ${otp}`); // For development

//     return res.status(200).json({
//       success: true,
//       message: "OTP sent successfully",
//       // In development, you can return OTP for testing
//       dev_otp: process.env.NODE_ENV === "development" ? otp : undefined,
//     });
//   } catch (error) {
//     console.error("Send OTP error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to send OTP",
//     });
//   }
// };

// export const verifyOTP = async (req: Request, res: Response) => {
//   try {
//     const { phone, otp } = req.body;

//     if (!phone || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone and OTP are required",
//       });
//     }

//     // Get stored OTP
//     const storedOTP = otpStore.get(phone);

//     if (!storedOTP) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP not found or expired",
//       });
//     }

//     // Check expiration
//     if (Date.now() > storedOTP.expiresAt) {
//       otpStore.delete(phone);
//       return res.status(400).json({
//         success: false,
//         message: "OTP has expired",
//       });
//     }

//     // Verify OTP
//     if (storedOTP.otp !== otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }

//     // OTP verified, get user details
//     const { data: user, error } = await supabase
//       .from("users")
//       .select("*")
//       .eq("phone", phone)
//       .single();

//     if (error || !user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: user.id, memberId: user.member_id },
//       process.env.JWT_SECRET!,
//       { expiresIn: "30d" }
//     );

//     // Clear OTP
//     otpStore.delete(phone);

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         member_id: user.member_id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         designation: user.designation,
//       },
//     });
//   } catch (error) {
//     console.error("Verify OTP error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to verify OTP",
//     });
//   }
// };

// export const register = async (req: Request, res: Response) => {
//   try {
//     const registrationData = req.body;

//     // Insert into members table (pending approval)
//     const { data, error } = await supabase
//       .from("member_registrations")
//       .insert([
//         {
//           ...registrationData,
//           status: "pending",
//           created_at: new Date().toISOString(),
//         },
//       ])
//       .select()
//       .single();

//     if (error) {
//       console.error("Registration error:", error);
//       return res.status(400).json({
//         success: false,
//         message: "Registration failed",
//         error: error.message,
//       });
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Registration submitted successfully. Awaiting approval.",
//       data,
//     });
//   } catch (error) {
//     console.error("Registration error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to process registration",
//     });
//   }
// };

// src/controllers/authController.ts
// src/controllers/authController.ts
import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import jwt from "jsonwebtoken";

// Temporary OTP storage (In production, use Redis or database)
const otpStore = new Map<
  string,
  { otp: string; expiresAt: number; userData: any }
>();

// Hardcoded OTP for development
const HARDCODED_OTP = "123456";

// ==================== SEND OTP API ====================
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { membership_id, phone } = req.body;

    // Validate input
    if (!membership_id || !phone) {
      return res.status(400).json({
        success: false,
        message: "Membership ID and phone number are required",
      });
    }

    let user = null;
    let userSource = "";

    // First, check in users table (existing members)
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("member_id", membership_id)
      .eq("phone", phone)
      .single();

    if (existingUser && !userError) {
      user = existingUser;
      userSource = "users";
      console.log("✅ User found in users table");
    } else {
      // If not found in users, check in member_registrations (newly registered)
      const { data: registeredUser, error: regError } = await supabase
        .from("member_registrations")
        .select("*")
        .eq("proposer_membership_id", membership_id) // Try proposer ID
        .eq("mobile_number", phone)
        .single();

      if (registeredUser && !regError) {
        user = {
          id: registeredUser.id,
          member_id: registeredUser.proposer_membership_id,
          name: registeredUser.proposer_name,
          email: registeredUser.email_id,
          phone: registeredUser.mobile_number,
          designation: "Member", // Default designation
          blood_group: registeredUser.blood_group,
          date_of_birth: registeredUser.date_of_birth,
        };
        userSource = "member_registrations";
        console.log("✅ User found in member_registrations table");
      }
    }

    // If user not found in either table
    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found with provided credentials. Please check your Membership ID and Phone Number.",
      });
    }

    // Use hardcoded OTP for development
    const otp = HARDCODED_OTP;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP with user data
    otpStore.set(phone, { otp, expiresAt, userData: { ...user, userSource } });

    console.log(`📱 OTP for ${phone}: ${otp}`);
    console.log(`👤 User: ${user.name} (${user.member_id})`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      // Return OTP in development
      dev_otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// ==================== VERIFY OTP API ====================
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    // Get stored OTP
    const storedData = otpStore.get(phone);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired. Please request a new OTP.",
      });
    }

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Verify OTP (hardcoded for development)
    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // OTP verified successfully
    const user = storedData.userData;

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        memberId: user.member_id,
        userSource: user.userSource,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    // Clear OTP
    otpStore.delete(phone);

    console.log(`✅ Login successful for ${user.name}`);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        member_id: user.member_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        blood_group: user.blood_group,
        date_of_birth: user.date_of_birth,
        image_url: user.image_url || null,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

// ==================== REGISTER NEW MEMBER API ====================
export const register = async (req: Request, res: Response) => {
  try {
    const {
      // Required fields
      proposer_name,
      proposer_membership_id,
      proposed_member_name,
      mobile_number,
      email_id,
      date_of_birth,
      blood_group,

      // Optional fields
      date_of_wedding,
      spouse_name,
      spouse_dob,
      spouse_blood_group,
      child1_name,
      child1_age,
      business_name,
      business_address,
      position,
      principal_activity,
      residential_address,
      member_of_chamber,
      social_activities,
      hobbies,
      rotary_interests,
      special_features,
      known_duration,
      terms_accepted,
      declaration_name,
      declaration_place,
      declaration_datetime,
    } = req.body;

    // Validate required fields
    if (
      !proposer_name ||
      !proposer_membership_id ||
      !proposed_member_name ||
      !mobile_number ||
      !email_id ||
      !date_of_birth ||
      !blood_group
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        required_fields: [
          "proposer_name",
          "proposer_membership_id",
          "proposed_member_name",
          "mobile_number",
          "email_id",
          "date_of_birth",
          "blood_group",
        ],
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(mobile_number)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    // Check if user with same phone or email already exists
    const { data: existingUser } = await supabase
      .from("member_registrations")
      .select("*")
      .or(`mobile_number.eq.${mobile_number},email_id.eq.${email_id}`)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "A registration with this phone number or email already exists",
      });
    }

    // Prepare registration data
    const registrationData = {
      proposer_name,
      proposer_membership_id,
      proposed_member_name,
      mobile_number,
      email_id,
      date_of_birth,
      blood_group,
      date_of_wedding: date_of_wedding || null,
      spouse_name: spouse_name || null,
      spouse_dob: spouse_dob || null,
      spouse_blood_group: spouse_blood_group || null,
      child1_name: child1_name || null,
      child1_age: child1_age || null,
      business_name: business_name || null,
      business_address: business_address || null,
      position: position || null,
      principal_activity: principal_activity || null,
      residential_address: residential_address || null,
      member_of_chamber: member_of_chamber || null,
      social_activities: social_activities || null,
      hobbies: hobbies || null,
      rotary_interests: rotary_interests || [],
      special_features: special_features || null,
      known_duration: known_duration || null,
      terms_accepted: terms_accepted || false,
      declaration_name: declaration_name || null,
      declaration_place: declaration_place || null,
      declaration_datetime: declaration_datetime || new Date().toISOString(),
      status: "pending",
      created_at: new Date().toISOString(),
    };

    // Insert into member_registrations table
    const { data, error } = await supabase
      .from("member_registrations")
      .insert([registrationData])
      .select()
      .single();

    if (error) {
      console.error("Registration error:", error);
      return res.status(400).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }

    console.log(
      `✅ New registration: ${data.proposed_member_name} (${data.mobile_number})`
    );

    return res.status(201).json({
      success: true,
      message:
        "Registration submitted successfully. You can now login with your Membership ID and Phone Number.",
      data: {
        id: data.id,
        proposer_membership_id: data.proposer_membership_id,
        proposed_member_name: data.proposed_member_name,
        mobile_number: data.mobile_number,
        email_id: data.email_id,
        status: data.status,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process registration",
    });
  }
};

// ==================== RESEND OTP API ====================
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { membership_id, phone } = req.body;

    if (!membership_id || !phone) {
      return res.status(400).json({
        success: false,
        message: "Membership ID and phone number are required",
      });
    }

    // Call the same logic as sendOTP
    return await sendOTP(req, res);
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};
