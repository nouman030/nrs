// Function to get AgencyId from URL parameters
export async function getAgencyIdFromUrl(params: { planId: string }) {
  try {
    // Extract planId from params
    const { planId } = params;

    // Validate planId
    if (!planId) {
      throw new Error('Plan ID is required');
    }

    // Return the planId as AgencyId
    return planId;
  } catch (error) {
    console.error('Error getting AgencyId:', error);
    throw error;
  }
}
