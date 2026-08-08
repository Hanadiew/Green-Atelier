<template>
  <div class="page-shell">
    <!-- dark: deep-green page header, so the bar inverts to light text until it is scrolled. -->
    <Navbar dark />

    <!-- ===== HERO / HEADER ===== -->
    <!-- The green band stays full-bleed; only its contents take the shared
         measure, so the band still reaches both edges of the viewport. -->
    <div class="hero-field page-top pb-16 text-center" style="color: white;">
      <div class="page-container">
        <p class="text-xs tracking-widest uppercase mb-3" style="color: #C9A96E;">Conscious Support</p>
        <h1 class="text-4xl font-light leading-tight mb-4" style="font-family: var(--font-display);">
          How Can We Assist You?
        </h1>
        <p class="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
          Questions about listing an item, how we review submissions, or an order that needs
          chasing? Send us a message and we will get back to you.
        </p>
      </div>
    </div>

    <!-- ===== TWO COLUMN LAYOUT: FORM & DETAILS ===== -->
    <div class="page-container py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
      
      <!-- Left Column: Contact Form (7 cols) -->
      <div class="md:col-span-7 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <h2 id="contact-form" class="text-lg font-semibold text-gray-800 mb-2 scroll-mt-32">Send Us a Message</h2>
        <p class="text-xs text-gray-400 mb-6">Fill out the form below and our team will get back to you within 24 hours.</p>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-gray-400 mb-1.5 block">Your Name</label>
              <input 
                v-model="form.name" 
                type="text" 
                required 
                placeholder="e.g. Mierza Azmi"
                class="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-xs outline-none bg-white focus:border-gray-400 transition"
              />
            </div>
            <div>
              <label class="text-xs text-gray-400 mb-1.5 block">Email Address</label>
              <input 
                v-model="form.email" 
                type="email" 
                required 
                placeholder="e.g. mierza@example.com"
                class="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-xs outline-none bg-white focus:border-gray-400 transition"
              />
            </div>
          </div>

          <div>
            <label class="text-xs text-gray-400 mb-1.5 block">Subject</label>
            <input 
              v-model="form.subject" 
              type="text" 
              required 
              placeholder="e.g. Inquiry about my listing verification"
              class="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-xs outline-none bg-white focus:border-gray-400 transition"
            />
          </div>

          <div>
            <label class="text-xs text-gray-400 mb-1.5 block">Message</label>
            <textarea 
              v-model="form.message" 
              rows="5" 
              required 
              placeholder="Write your message here..."
              class="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-xs outline-none bg-white focus:border-gray-400 transition resize-none"
            ></textarea>
          </div>

          <p v-if="errorMsg" class="text-xs text-red-400">{{ errorMsg }}</p>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full py-3 text-xs  rounded-md tracking-wider font-medium uppercase shadow transition active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed btn-solid"
          >
            {{ submitting ? 'Sending…' : 'Send Message' }}
          </button>
        </form>
      </div>

      <!-- Right Column: Details & Socials (5 cols) -->
      <div class="md:col-span-5 flex flex-col justify-between space-y-8">
        
        <!-- Direct Contacts -->
        <div class="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
          <h2 class="text-lg font-semibold text-gray-800">Atelier Contacts</h2>

          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: #F2F0EB;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-700 mb-0.5">Email Support</p>
              <a href="mailto:support@greenatelier.com" class="text-xs text-gray-500 hover:underline transition" style="color: #C9A96E;">
                support@greenatelier.com
              </a>
              <p class="text-xs text-gray-400 mt-1">Direct support for order and verification queries.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: #F2F0EB;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-700 mb-0.5">Operating Hours</p>
              <p class="text-xs text-gray-500">Monday to Friday: 9:00 AM to 6:00 PM</p>
              <p class="text-xs text-gray-500">Saturday & Sunday: Closed</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: #F2F0EB;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-700 mb-0.5">HQ Studio</p>
              <p class="text-xs text-gray-500 leading-relaxed">
                Green Atelier Studio<br />
                Bangsar South, 59200<br />
                Kuala Lumpur, Malaysia
              </p>
            </div>
          </div>
        </div>

        <!-- Social Media Links -->
        <div class="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col justify-center space-y-4">
          <p class="text-xs tracking-widest uppercase text-center" style="color: #C9A96E;">Follow Us</p>
          <div class="flex justify-center gap-6">
            <!-- Instagram -->
            <a href="#" class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all duration-300 hover:scale-110" style="background-color: #F2F0EB;" onmouseover="this.style.backgroundColor='#C9A96E'; this.style.color='white'" onmouseout="this.style.backgroundColor='#F2F0EB'; this.style.color='#6B7280'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a4 4 0 100 8 4 4 0 000-8zm4.5-1a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
            </a>
            <!-- Facebook -->
            <a href="#" class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all duration-300 hover:scale-110" style="background-color: #F2F0EB;" onmouseover="this.style.backgroundColor='#C9A96E'; this.style.color='white'" onmouseout="this.style.backgroundColor='#F2F0EB'; this.style.color='#6B7280'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <!-- Pinterest / Web -->
            <a href="#" class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all duration-300 hover:scale-110" style="background-color: #F2F0EB;" onmouseover="this.style.backgroundColor='#C9A96E'; this.style.color='white'" onmouseout="this.style.backgroundColor='#F2F0EB'; this.style.color='#6B7280'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </div>

    <!-- ===== FAQ SECTION (SCROLL TARGET) ===== -->
    <div id="faq" class="bg-white border-t border-gray-100 py-24 scroll-mt-20">
      <div class="page-container">
        
        <!-- FAQ Title -->
        <div class="text-center mb-16">
          <p class="text-xs tracking-widest uppercase mb-3" style="color: #C9A96E;">Find Answers</p>
          <h2 class="text-3xl font-light text-gray-800" style="font-family: var(--font-display);">
            Frequently Asked Questions
          </h2>
          <div class="w-16 h-0.5 mx-auto mt-4" style="background-color: #C9A96E;"></div>
        </div>

        <FaqAccordion />

      </div>
    </div>

    <!-- ===== SUCCESS MODAL ===== -->
    <Teleport to="body">
      <div v-if="showSuccess" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center text-center max-w-sm w-full mx-4 border border-gray-100">
          <div class="w-14 h-14 rounded-full flex items-center justify-center mb-5" style="background-color: #E8F5EE;">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 class="text-base font-semibold text-gray-800 mb-1">Message Sent!</h3>
          <p class="text-xs text-gray-400 leading-relaxed mb-6">
            Thank you for contacting Green Atelier. Our curators will review your inquiry and reply via email within 24 hours.
          </p>
          <button @click="showSuccess = false" 
            class="w-full py-2.5 text-xs  rounded-md transition font-medium uppercase tracking-wider cursor-pointer btn-solid"
          >
            Dismiss
          </button>
        </div>
      </div>
    </Teleport>

    <Footer />
  </div>
</template>

<script setup>
import Icon from '../components/Icon.vue'
import FaqAccordion from '../components/FaqAccordion.vue'
import { onMounted, ref } from 'vue'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import { submitContactMessage } from '../lib/contact.js'
import { displayName, userEmail, userId } from '../lib/auth.js'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

// Prefill for signed-in visitors so they are not retyping what we know.
onMounted(() => {
  if (userEmail.value) form.value.email = userEmail.value
  if (displayName.value) form.value.name = displayName.value
})

const showSuccess = ref(false)


const submitting = ref(false)
const errorMsg = ref('')

const handleSubmit = async () => {
  errorMsg.value = ''

  if (!form.value.name.trim() || !form.value.email.trim() || !form.value.message.trim()) {
    errorMsg.value = 'Please fill in your name, email and message.'
    return
  }

  submitting.value = true
  try {
    // Works whether or not the visitor is signed in.
    await submitContactMessage(form.value, userId.value)
    form.value = { name: '', email: '', subject: '', message: '' }
    showSuccess.value = true
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Ensure smooth transitions on focus states */
input, textarea {
  transition: border-color 0.2s ease-in-out;
}
</style>
