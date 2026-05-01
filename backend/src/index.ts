// Only export functions intended for deployment. Reserved scaffolds stay
// importable from disk but are kept off the deploy graph until needed.
export { onUserCreate } from './onUserCreate';

// Reserved (not deployed in MVP):
// export { exportUserData } from './exportUserData';
// export { recalculatePastMeals } from './recalculatePastMeals';
// export { dailyRollup } from './dailyRollup';
