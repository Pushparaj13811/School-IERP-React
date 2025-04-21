import { userAPI } from './api';
import { toast } from 'react-toastify';
import { Student, Teacher, Parent } from '../types/api';
import { ProfileApiResponse } from './profileService';
import api from './api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Interface for the user profile with additional context
export interface UserProfile {
  id: number;
  email: string;
  role: string;
  name: string;
  profilePicture?: string | { id: number; url: string } | null;
  displayName: string;
  roleSpecificData?: Student | Teacher | Parent | Record<string, unknown>;
  isActive: boolean;
}

// Define a type to handle the API student data
interface ApiStudent {
  id: number;
  name?: string;
  class?: { name?: string };
  section?: { name?: string };
}

// Profile data structure from API
interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  profileDetails: Record<string, string>;
  addressDetails?: Record<string, string>;
  childrenDetails?: Array<Record<string, string>>;
  profilePicture?: string | null;
}

class UserService {
  private userCache: UserProfile | null = null;
  
  // Get logged in user profile with all details
  async getUserProfile(): Promise<UserProfile | null> {
    // If we have cached data, return it
    if (this.userCache) {
      return this.userCache;
    }
    
    try {
      const response = await userAPI.getProfile();
      console.log('API response:', response.data);
      
      // Cast to our specific response structure which includes the nested user
      const profileResponse = response.data as unknown as ProfileApiResponse;
      
      if (profileResponse?.status === 'success' && profileResponse?.data?.user) {
        const userData = profileResponse.data.user;
        console.log('User data from API:', userData);
        
        // Initialize with default values
        const userProfile: UserProfile = {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          name: userData.email, // Default fallback name
          displayName: userData.email,
          isActive: true // Default to active
        };
        
        // Extract role-specific data and update name accordingly
        if (userData.role === 'STUDENT' && userData.student) {
          console.log('Processing student data:', userData.student);
          userProfile.name = userData.student.name || userData.email;
          userProfile.profilePicture = userData.student.profilePicture;
          // Store as roleSpecificData but don't try to convert to Student type
          userProfile.roleSpecificData = userData.student;
          userProfile.displayName = this.formatStudentDisplayName(userData.student as ApiStudent);
        } else if (userData.role === 'TEACHER' && userData.teacher) {
          console.log('Processing teacher data:', userData.teacher);
          userProfile.name = userData.teacher.name || userData.email;
          userProfile.profilePicture = userData.teacher.profilePicture;
          userProfile.roleSpecificData = userData.teacher;
          userProfile.displayName = userData.teacher.name || userData.email;
        } else if (userData.role === 'PARENT' && userData.parent) {
          console.log('Processing parent data:', userData.parent);
          userProfile.name = userData.parent.name || userData.email;
          userProfile.profilePicture = userData.parent.profilePicture;
          userProfile.roleSpecificData = userData.parent;
          userProfile.displayName = userData.parent.name || userData.email;
        } else if (userData.role === 'ADMIN' && userData.admin) {
          console.log('Processing admin data:', userData.admin);
          userProfile.name = userData.admin.fullName || userData.email;
          // For admin, we need to pass the whole profilePicture object to maintain the URL structure
          userProfile.profilePicture = userData.admin.profilePicture;
          userProfile.roleSpecificData = userData.admin;
          userProfile.displayName = userData.admin.fullName || userData.email;
        }
        
        console.log('Processed user profile:', userProfile);
        
        // Cache the processed user profile
        this.userCache = userProfile;
        return userProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
  
  // Format a student's display name (used for UI)
  formatStudentDisplayName(student: Student | ApiStudent | null): string {
    if (!student) return 'Student';
    
    let displayName = student.name || 'Student';
    
    // Handle both Student type and API student type
    if ('class' in student && student.class) {
      // For ApiStudent
      if (typeof student.class === 'object' && 'name' in student.class) {
        displayName += ` (${student.class.name || ''}`;
        if (student.section && typeof student.section === 'object' && 'name' in student.section) {
          displayName += ` ${student.section.name || ''}`;
        }
        displayName += ')';
      } 
      // For Student
      else if (student.class && typeof student.class.name === 'string') {
        displayName += ` (${student.class.name}`;
        if (student.section && student.section.name) {
          displayName += ` ${student.section.name}`;
        }
        displayName += ')';
      }
    }
    
    return displayName;
  }
  
  // Get formatted role name for display
  getRoleDisplayName(role: string | undefined | null): string {
    if (!role) return 'User';
    
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'Administrator';
      case 'TEACHER':
        return 'Teacher';
      case 'STUDENT':
        return 'Student';
      case 'PARENT':
        return 'Parent';
      default:
        return role;
    }
  }
  
  // Get the profile picture URL
  getProfileImageUrl(profilePicture?: string | { id: number; url: string } | null): string {
    console.log('getProfileImageUrl received:', profilePicture);
    
    try {
      // Check if profilePicture is an object with url property
      if (typeof profilePicture === 'object' && profilePicture !== null) {
        console.log('Profile picture is an object:', profilePicture);
        
        // If it's an admin profile picture with defined structure
        if ('url' in profilePicture && profilePicture.url) {
          console.log('Found url property:', profilePicture.url);
          
          // Check if the URL is already absolute
          if (profilePicture.url.startsWith('http://') || profilePicture.url.startsWith('https://')) {
            return profilePicture.url;
          }
          
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
          return `${baseUrl}${profilePicture.url.startsWith('/') ? '' : '/'}${profilePicture.url}`;
        }
        
        console.log('No url property found in object');
        return "/default-avatar.png";
      }
      
      // If it's a string
      if (typeof profilePicture === 'string') {
        console.log('Profile picture is a string:', profilePicture);
        
        // Check if it's already a full URL
        if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
          console.log('Already a full URL');
          return profilePicture;
        }
        
        // Otherwise, prepend the API base URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const fullUrl = `${baseUrl}${profilePicture.startsWith('/') ? '' : '/'}${profilePicture}`;
        console.log('Created full URL:', fullUrl);
        return fullUrl;
      }

      return "/default-avatar.png";
    } catch (error) {
      console.error("Error processing profile picture:", error);
      return "/default-avatar.png";
    }
  }
  
  // Clear the user cache (useful after logout or updates)
  clearCache(): void {
    this.userCache = null;
  }

  // Generate PDF from profile data
  private generateProfilePDF(profileData: ProfileData, profileImageUrl?: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary container to render the profile
        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.width = '800px';
        container.style.backgroundColor = 'white';
        document.body.appendChild(container);

        // Create header with profile image and name
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.marginBottom = '20px';
        header.style.padding = '10px';
        header.style.backgroundColor = '#f0f7ff';
        header.style.borderRadius = '8px';

        // Function to continue PDF generation after image is loaded (or if there's no image)
        const continueWithPdfGeneration = () => {
          // Create Personal Details section
          this.createSection(container, 'Personal Details', profileData.profileDetails);
          
          // Create Address Details section if available
          if (profileData.addressDetails && Object.keys(profileData.addressDetails).length > 0) {
            this.createSection(container, 'Address Details', profileData.addressDetails);
          }
          
          // Create Children Details section for parents
          if (profileData.childrenDetails && profileData.childrenDetails.length > 0) {
            const childrenSection = document.createElement('div');
            childrenSection.style.marginBottom = '20px';
            
            const childrenTitle = document.createElement('h2');
            childrenTitle.textContent = 'Children';
            childrenTitle.style.borderBottom = '2px solid #3b82f6';
            childrenTitle.style.paddingBottom = '8px';
            childrenTitle.style.fontSize = '20px';
            childrenTitle.style.color = '#1e3a8a';
            childrenSection.appendChild(childrenTitle);
            
            profileData.childrenDetails.forEach((child, index) => {
              const childCard = document.createElement('div');
              childCard.style.marginTop = '10px';
              childCard.style.padding = '10px';
              childCard.style.backgroundColor = '#f1f5f9';
              childCard.style.borderRadius = '8px';
              
              const childTitle = document.createElement('h3');
              childTitle.textContent = `Child ${index + 1}: ${child['Name'] || 'N/A'}`;
              childTitle.style.margin = '0 0 10px 0';
              childTitle.style.fontSize = '18px';
              childTitle.style.color = '#334155';
              childCard.appendChild(childTitle);
              
              Object.entries(child).forEach(([key, value]) => {
                if (key !== 'Name') { // Skip name as it's already in the title
                  const detail = document.createElement('p');
                  detail.style.margin = '5px 0';
                  detail.style.fontSize = '14px';
                  
                  const keySpan = document.createElement('span');
                  keySpan.textContent = key + ': ';
                  keySpan.style.fontWeight = 'bold';
                  keySpan.style.color = '#475569';
                  detail.appendChild(keySpan);
                  
                  const valueSpan = document.createElement('span');
                  valueSpan.textContent = value;
                  valueSpan.style.color = '#1f2937';
                  detail.appendChild(valueSpan);
                  
                  childCard.appendChild(detail);
                }
              });
              
              childrenSection.appendChild(childCard);
            });
            
            container.appendChild(childrenSection);
          }

          // Create timestamp and footer
          const footer = document.createElement('div');
          footer.style.marginTop = '40px';
          footer.style.borderTop = '1px solid #e5e7eb';
          footer.style.paddingTop = '10px';
          footer.style.fontSize = '12px';
          footer.style.color = '#9ca3af';
          footer.style.textAlign = 'center';
          
          const timestamp = document.createElement('p');
          timestamp.textContent = `Generated on ${new Date().toLocaleString()}`;
          timestamp.style.margin = '0';
          footer.appendChild(timestamp);
          
          const poweredBy = document.createElement('p');
          poweredBy.textContent = 'School Management System';
          poweredBy.style.margin = '5px 0 0 0';
          footer.appendChild(poweredBy);
          
          container.appendChild(footer);

          // Give the browser a moment to render everything
          setTimeout(() => {
            // Generate PDF
            html2canvas(container, {
              useCORS: true, // Try to load cross-origin images
              allowTaint: true, // Allow images from other domains
              logging: false,
              scale: 2 // Higher resolution
            }).then(canvas => {
              // Remove the temporary container
              document.body.removeChild(container);
              
              // Create PDF
              const pdf = new jsPDF('p', 'mm', 'a4');
              const imgData = canvas.toDataURL('image/png');
              const imgWidth = 210; // A4 width in mm
              const pageHeight = 297; // A4 height in mm
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
              let heightLeft = imgHeight;
              let position = 0;

              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;

              // Add additional pages if content overflows
              while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
              }

              // Convert to blob
              const pdfBlob = pdf.output('blob');
              resolve(pdfBlob);
            }).catch(error => {
              console.error("Error generating PDF:", error);
              reject(error);
            });
          }, 500); // Small delay to ensure rendering is complete
        };

        const nameContainer = document.createElement('div');
        
        const name = document.createElement('h1');
        name.textContent = profileData.name;
        name.style.margin = '0';
        name.style.fontSize = '28px';
        name.style.color = '#1e3a8a';
        nameContainer.appendChild(name);
        
        const role = document.createElement('p');
        role.textContent = this.getRoleDisplayName(profileData.role);
        role.style.margin = '5px 0 0 0';
        role.style.fontSize = '16px';
        role.style.color = '#4b5563';
        nameContainer.appendChild(role);
        
        const email = document.createElement('p');
        email.textContent = profileData.email;
        email.style.margin = '5px 0 0 0';
        email.style.fontSize = '14px';
        email.style.color = '#6b7280';
        nameContainer.appendChild(email);
        
        header.appendChild(nameContainer);
        container.appendChild(header);

        // Handle profile image loading
        if (profileImageUrl) {
          const img = new Image();
          img.crossOrigin = "Anonymous"; // Try to handle CORS issues
          img.style.width = '100px';
          img.style.height = '100px';
          img.style.borderRadius = '50%';
          img.style.border = '4px solid #3b82f6';
          img.style.marginRight = '20px';
          
          // Add image once it's loaded
          img.onload = () => {
            header.insertBefore(img, header.firstChild);
            continueWithPdfGeneration();
          };
          
          // Handle image loading errors
          img.onerror = () => {
            console.warn('Failed to load profile image:', profileImageUrl);
            // Try with a default avatar
            img.src = '/default-avatar.png';
            // If that also fails, continue without an image
            img.onerror = () => {
              console.warn('Failed to load default avatar, continuing without image');
              continueWithPdfGeneration();
            };
          };
          
          // Start loading the image
          img.src = profileImageUrl;
        } else {
          // No profile image, continue with PDF generation
          continueWithPdfGeneration();
        }
      } catch (error) {
        console.error("Error setting up PDF generation:", error);
        reject(error);
      }
    });
  }

  // Helper method to create a section in the PDF
  private createSection(container: HTMLElement, title: string, details: Record<string, string>): void {
    const section = document.createElement('div');
    section.style.marginBottom = '20px';
    
    const sectionTitle = document.createElement('h2');
    sectionTitle.textContent = title;
    sectionTitle.style.borderBottom = '2px solid #3b82f6';
    sectionTitle.style.paddingBottom = '8px';
    sectionTitle.style.fontSize = '20px';
    sectionTitle.style.color = '#1e3a8a';
    section.appendChild(sectionTitle);
    
    const detailsGrid = document.createElement('div');
    detailsGrid.style.display = 'grid';
    detailsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    detailsGrid.style.gap = '10px';
    detailsGrid.style.marginTop = '10px';
    
    Object.entries(details).forEach(([key, value]) => {
      const detail = document.createElement('p');
      detail.style.margin = '5px 0';
      detail.style.fontSize = '14px';
      
      const keySpan = document.createElement('span');
      keySpan.textContent = key + ': ';
      keySpan.style.fontWeight = 'bold';
      keySpan.style.color = '#475569';
      detail.appendChild(keySpan);
      
      const valueSpan = document.createElement('span');
      valueSpan.textContent = value;
      valueSpan.style.color = '#1f2937';
      detail.appendChild(valueSpan);
      
      detailsGrid.appendChild(detail);
    });
    
    section.appendChild(detailsGrid);
    container.appendChild(section);
  }

  // Download profile as PDF
  downloadProfile(userRole: string, userId: number): Promise<void> {
    // Keep userRole in uppercase for the API call as the backend validation expects it
    const url = `/users/download-profile/${userRole.toUpperCase()}/${userId}`;
    
    toast.info("Generating PDF from profile data...");
    
    // Use the configured api instance to get JSON data
    return api.get(url, {
      responseType: 'json'
    })
    .then(async response => {
      try {
        // Get profile data from response
        const profileData = response.data as ProfileData;
        
        // Generate file name based on user's name
        const sanitizedName = profileData.name.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');
        const fileName = `${sanitizedName}_Profile.pdf`;
        
        // Get profile image URL if available
        let profileImageUrl;
        if (profileData.profilePicture) {
          profileImageUrl = this.getProfileImageUrl(profileData.profilePicture);
        }
        
        // Generate PDF from profile data
        const pdfBlob = await this.generateProfilePDF(profileData, profileImageUrl);
        
        // Trigger download
        const downloadUrl = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(link);
        
        toast.success('Profile PDF downloaded successfully!');
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('Failed to generate PDF. Downloading JSON instead.');
        
        // Fallback to JSON download if PDF generation fails
        const fallbackFileName = `${userRole.toLowerCase()}_profile_${userId}.json`;
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fallbackFileName);
        document.body.appendChild(link);
        link.click();
        
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(link);
      }
    })
    .catch(error => {
      console.error('Error downloading profile:', error);
      toast.error('Failed to download profile. Please try again.');
      throw error;
    }) as Promise<void>;
  }
}

export const userService = new UserService();
export default userService; 