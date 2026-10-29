/**
 * Helper to parse teacher academic biographie JSON or raw HTML
 */
export const parseTeacherBio = (biographie) => {
  if (!biographie) {
    return {
      presentationHtml: '',
      themesRecherche: [],
      enseignements: [],
      publications: [],
      liensAcademiques: {
        googleScholar: '',
        researchGate: '',
        orcid: '',
        dblp: '',
        linkedin: '',
        github: '',
      }
    };
  }

  try {
    const parsed = JSON.parse(biographie);
    return {
      presentationHtml: parsed.presentationHtml || '',
      themesRecherche: Array.isArray(parsed.themesRecherche) ? parsed.themesRecherche : [],
      enseignements: Array.isArray(parsed.enseignements) ? parsed.enseignements : [],
      publications: Array.isArray(parsed.publications) ? parsed.publications : [],
      liensAcademiques: parsed.liensAcademiques || {
        googleScholar: '',
        researchGate: '',
        orcid: '',
        dblp: '',
        linkedin: '',
        github: '',
      }
    };
  } catch (e) {
    // If it is legacy plain HTML or text
    return {
      presentationHtml: biographie,
      themesRecherche: [],
      enseignements: [],
      publications: [],
      liensAcademiques: {
        googleScholar: '',
        researchGate: '',
        orcid: '',
        dblp: '',
        linkedin: '',
        github: '',
      }
    };
  }
};
