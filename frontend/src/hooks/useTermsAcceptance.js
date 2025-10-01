import { useState, useEffect } from 'react';

const TERMS_VERSION = '2.0'; // Update this when terms change significantly

export const useTermsAcceptance = (user) => {
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkTermsAcceptance = () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        const stored = localStorage.getItem('spainrp_terms_accepted');
        
        if (!stored) {
          // No previous acceptance
          setNeedsAcceptance(true);
          setIsChecking(false);
          return;
        }

        const acceptanceData = JSON.parse(stored);
        
        // Check if version matches and user matches
        if (acceptanceData.version !== TERMS_VERSION || acceptanceData.userId !== user.id) {
          setNeedsAcceptance(true);
        } else {
          setNeedsAcceptance(false);
        }
      } catch (error) {
        console.error('[Terms] Error checking acceptance:', error);
        setNeedsAcceptance(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkTermsAcceptance();
  }, [user]);

  const acceptTerms = () => {
    if (!user) return;

    const acceptanceData = {
      accepted: true,
      timestamp: new Date().toISOString(),
      userId: user.id,
      version: TERMS_VERSION
    };

    localStorage.setItem('spainrp_terms_accepted', JSON.stringify(acceptanceData));
    setNeedsAcceptance(false);
  };

  const rejectTerms = () => {
    // Clear all user data
    localStorage.removeItem('spainrp_token');
    localStorage.removeItem('spainrp_terms_accepted');
    setNeedsAcceptance(false);
    
    // Redirect to home
    window.location.href = '/';
  };

  return {
    needsAcceptance,
    isChecking,
    acceptTerms,
    rejectTerms
  };
};
