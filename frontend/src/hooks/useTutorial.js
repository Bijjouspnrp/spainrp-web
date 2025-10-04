import { useState, useEffect } from 'react';

const useTutorial = () => {
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Verificar si debe mostrar el tutorial
  useEffect(() => {
    const checkTutorialStatus = () => {
      const completed = localStorage.getItem('spainrp_tutorial_completed');
      const skipped = localStorage.getItem('spainrp_tutorial_skipped');
      const firstVisit = localStorage.getItem('spainrp_first_visit');
      
      // Si es la primera visita y no ha completado ni saltado el tutorial
      if (!firstVisit && !completed && !skipped) {
        setShouldShowTutorial(true);
        localStorage.setItem('spainrp_first_visit', 'true');
        localStorage.setItem('spainrp_first_visit_date', new Date().toISOString());
      }
      
      // Si ya completó el tutorial
      if (completed) {
        setTutorialCompleted(true);
        setShouldShowTutorial(false);
      }
      
      // Si saltó el tutorial
      if (skipped) {
        setTutorialCompleted(false);
        setShouldShowTutorial(false);
      }
    };

    checkTutorialStatus();
    setIsInitialized(true);
  }, []);

  // Abrir tutorial
  const openTutorial = () => {
    setIsTutorialOpen(true);
  };

  // Cerrar tutorial
  const closeTutorial = () => {
    setIsTutorialOpen(false);
  };

  // Completar tutorial
  const completeTutorial = () => {
    localStorage.setItem('spainrp_tutorial_completed', 'true');
    localStorage.setItem('spainrp_tutorial_completed_date', new Date().toISOString());
    setTutorialCompleted(true);
    setShouldShowTutorial(false);
    setIsTutorialOpen(false);
  };

  // Saltar tutorial
  const skipTutorial = () => {
    localStorage.setItem('spainrp_tutorial_skipped', 'true');
    localStorage.setItem('spainrp_tutorial_skipped_date', new Date().toISOString());
    setTutorialCompleted(false);
    setShouldShowTutorial(false);
    setIsTutorialOpen(false);
  };

  // Reiniciar tutorial (para administradores)
  const resetTutorial = () => {
    localStorage.removeItem('spainrp_tutorial_completed');
    localStorage.removeItem('spainrp_tutorial_skipped');
    localStorage.removeItem('spainrp_tutorial_completed_date');
    localStorage.removeItem('spainrp_tutorial_skipped_date');
    setTutorialCompleted(false);
    setShouldShowTutorial(true);
  };

  // Obtener estadísticas del tutorial
  const getTutorialStats = () => {
    const completed = localStorage.getItem('spainrp_tutorial_completed');
    const skipped = localStorage.getItem('spainrp_tutorial_skipped');
    const completedDate = localStorage.getItem('spainrp_tutorial_completed_date');
    const skippedDate = localStorage.getItem('spainrp_tutorial_skipped_date');
    const firstVisit = localStorage.getItem('spainrp_first_visit_date');

    return {
      completed: !!completed,
      skipped: !!skipped,
      completedDate: completedDate ? new Date(completedDate) : null,
      skippedDate: skippedDate ? new Date(skippedDate) : null,
      firstVisit: firstVisit ? new Date(firstVisit) : null,
      status: completed ? 'completed' : skipped ? 'skipped' : 'not_started'
    };
  };

  // Asegurar que siempre devolvemos un objeto válido
  return {
    shouldShowTutorial: shouldShowTutorial || false,
    isTutorialOpen: isTutorialOpen || false,
    tutorialCompleted: tutorialCompleted || false,
    isInitialized: isInitialized || false,
    openTutorial: openTutorial || (() => {}),
    closeTutorial: closeTutorial || (() => {}),
    completeTutorial: completeTutorial || (() => {}),
    skipTutorial: skipTutorial || (() => {}),
    resetTutorial: resetTutorial || (() => {}),
    getTutorialStats: getTutorialStats || (() => ({}))
  };
};

export default useTutorial;
