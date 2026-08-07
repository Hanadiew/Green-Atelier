<template>
  <div class="page-shell">
    <!-- dark: full-height deep-green hero, so the bar inverts to light text until it is scrolled. -->
    <Navbar dark />

    <!-- The narrative order is the point: the problem, then that existing pieces
         still have value, then how the platform makes passing them on easy, then
         what the visitor can do. Each section owns its own scroll reveal, so they
         arrive one at a time rather than all at once.

         No .page-top here — the hero is full-height and sits under the floating
         navbar deliberately, as on Home and About. -->
    <main>
      <SustainableHero />
      <ImpactStats />
      <SustainabilityProblem />
      <CircularFashion />
      <SustainablePractices />
      <ImpactSection />
      <CareGuide />
      <SellerSustainabilityCTA />
      <ResponsibleResale />
      <SustainableFinalCTA />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Footer from '../components/Footer.vue'
import Navbar from '../components/Navbar.vue'
import CareGuide from '../components/sustainable/CareGuide.vue'
import CircularFashion from '../components/sustainable/CircularFashion.vue'
import ImpactSection from '../components/sustainable/ImpactSection.vue'
import ImpactStats from '../components/sustainable/ImpactStats.vue'
import ResponsibleResale from '../components/sustainable/ResponsibleResale.vue'
import SellerSustainabilityCTA from '../components/sustainable/SellerSustainabilityCTA.vue'
import SustainabilityProblem from '../components/sustainable/SustainabilityProblem.vue'
import SustainableFinalCTA from '../components/sustainable/SustainableFinalCTA.vue'
import SustainableHero from '../components/sustainable/SustainableHero.vue'
import SustainablePractices from '../components/sustainable/SustainablePractices.vue'
</script>
