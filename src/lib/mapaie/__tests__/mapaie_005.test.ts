import { calculerHeuresSup, verifierMinimumConventionnel } from '../calculations'

describe('calculerHeuresSup', () => {
  it('calcule les HS tranche1 uniquement (35h légales, 40h travaillées)', () => {
    const result = calculerHeuresSup(40, 15, 0)
    expect(result.heuresTranche1).toBe(5)
    expect(result.heuresTranche2).toBe(0)
    expect(result.montantDuTranche1).toBeCloseTo(5 * 15 * 1.25, 2)
    expect(result.montantDuTotal).toBeCloseTo(result.montantDuTranche1, 2)
    expect(result.rappel).toBeCloseTo(result.montantDuTotal, 2)
    expect(result.tauxMajoration1Applique).toBe(0.25)
  })

  it('calcule les HS tranche1 + tranche2 (48h travaillées)', () => {
    const result = calculerHeuresSup(48, 12, 0)
    expect(result.heuresTranche1).toBeGreaterThan(0)
    expect(result.heuresTranche2).toBeGreaterThan(0)
    expect(result.tauxMajoration2Applique).toBe(0.5)
    expect(result.montantDuTotal).toBeCloseTo(
      result.montantDuTranche1 + result.montantDuTranche2, 2
    )
  })

  it('retourne zéro si heures <= seuil légal', () => {
    const result = calculerHeuresSup(35, 14, 0)
    expect(result.heuresTranche1).toBe(0)
    expect(result.heuresTranche2).toBe(0)
    expect(result.montantDuTotal).toBe(0)
    expect(result.rappel).toBe(0)
  })

  it('calcule le rappel correctement quand paiement partiel', () => {
    const result = calculerHeuresSup(40, 15, 50)
    const du = 5 * 15 * 1.25
    expect(result.rappel).toBeCloseTo(Math.max(0, du - 50), 2)
  })

  it('rappel = 0 si déjà trop payé', () => {
    const result = calculerHeuresSup(40, 15, 999)
    expect(result.rappel).toBe(0)
  })

  it('applique la convention collective avec seuil personnalisé', () => {
    const convention = { seuilDeclenchement: 37, tranche1Max: 43, tranche1Majoration: 0.1, tranche2Majoration: 0.5, contingentAnnuel: 220, reposCompensateurObligatoire: false }
    const result = calculerHeuresSup(40, 10, 0, convention)
    expect(result.heuresTranche1).toBe(3)
    expect(result.tauxMajoration1Applique).toBeGreaterThanOrEqual(0.1)
  })

  it('applique le minimum légal si majoration CCN inférieure', () => {
    const convention = { seuilDeclenchement: 35, tranche1Max: 43, tranche1Majoration: 0.05, tranche2Majoration: 0.05, contingentAnnuel: 220, reposCompensateurObligatoire: false }
    const result = calculerHeuresSup(40, 10, 0, convention)
    expect(result.tauxMajoration1Applique).toBeGreaterThanOrEqual(0.1)
    expect(result.tauxMajoration2Applique).toBeGreaterThanOrEqual(0.1)
  })
})

describe('verifierMinimumConventionnel', () => {
  it('conforme au SMIC quand pas de CCN', () => {
    const result = verifierMinimumConventionnel(1802, null)
    expect(result.baseReference).toBe('SMIC')
    expect(result.estConforme).toBe(true)
    expect(result.ecart).toBeGreaterThanOrEqual(0)
  })

  it('non conforme si salaire sous SMIC', () => {
    const result = verifierMinimumConventionnel(1000, null)
    expect(result.estConforme).toBe(false)
    expect(result.ecart).toBeLessThan(0)
  })

  it('utilise CCN si supérieure au SMIC', () => {
    const result = verifierMinimumConventionnel(2000, 1950)
    expect(result.baseReference).toBe('CCN')
    expect(result.minimumApplicable).toBe(1950)
    expect(result.estConforme).toBe(true)
  })

  it('utilise SMIC si CCN inférieure', () => {
    const result = verifierMinimumConventionnel(1802, 1200)
    expect(result.baseReference).toBe('SMIC')
  })

  it('proratise le SMIC selon heures mensuelles', () => {
    const result = verifierMinimumConventionnel(900, null, 104)
    expect(result.minimumApplicable).toBeLessThan(1802)
  })
})