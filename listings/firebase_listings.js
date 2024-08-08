import { doc, getDoc, query, collection, where, getDocs, orderBy, updateDoc } from 'firebase/firestore'
import { db, storage } from '../firebase/Firebase'
import { ref } from 'firebase/storage'
import { FB_LISTINGS, FB_USERS, FB_ACTIVITIES, FB_SHIFTS, FB_STORE, LISTING_DEFAULT_COLOR } from '../reference'
import { getPhotoFileFromStorage } from '../backend/Utilities'
import Activity from './firebase_activities'
import Shift from './firebase_shifts'
import { checkValidSlot } from '../utilities/dateUtils'

export default class Listing {
  constructor (id) {
    this.id = id
  }

  async fetchAll () {
    await this.fetch()
    await this.fetchEmployerName()
    await this.fetchImage()
  }

  async fetch () {
    const docRef = doc(db, FB_LISTINGS, this.id)
    const docSnap = await getDoc(docRef)
    const data = docSnap.data()
    this._attire = data.attire || ''
    this._jobClosingTime = data.jobClosingTime || 0
    this._requirement = data.requirement || ''
    this._category = data.category || ''
    this._selectedTags = data.selectedTags || []
    this._createdAt = data.createdAt
    this._dates = data.dates || []
    this._employerId = data.employerId
    this._isActive = data.isActive || false
    this._latestApplicationDate = data.latestApplicationDate
    this._lat = data.lat || 0
    this._lng = data.lng || 0
    this._salary = data.salary || 0
    this._streetName = data.streetName || ''
    this._settings = data.settings || 'all'
    this._transport = data.transport || 0
    this._trigram = data.trigram || {}
    this._locationInfo = data.locationInfo || ''
    this._updatedAt = data.updatedAt
    this._workerIds = data.workerIds || []
    this._listingColor = data.listingColor ? data.listingColor : LISTING_DEFAULT_COLOR
  }

  async fetchEmployerName () {
    // TODO: implement when employer object is created
    const docRef = doc(db, FB_STORE, this.employerId)
    const docSnap = await getDoc(docRef)
    const data = docSnap.data()
    this._employerName = data.employerName || ''
    return this._employerName
  }

  async fetchImage () {
    try {
      const photoFile = await getPhotoFileFromStorage(ref(storage, `${FB_LISTINGS}/${this.id}`))
      this._photo = photoFile
    } catch (error) {
      console.log(error)
      this._photo = await getPhotoFileFromStorage(ref(storage, `${FB_LISTINGS}/listing_placeholder.jpg`))
    }
  }

  findCommonDocuments (q1, q2) {
    const queryDocIds = new Set()
    const commonDocuments = []

    // Add all document IDs from the first snapshot to the set
    q1.forEach((doc) => {
      queryDocIds.add(doc.id)
    })

    // Check each document in the second snapshot
    q2.forEach((doc) => {
      // If the document ID exists in the set, it's a common document
      if (queryDocIds.has(doc.id)) {
        commonDocuments.push(doc)
      }
    })

    return commonDocuments
  }

  async getCorrespondingActivities () {
    const queryRef = query(collection(db, FB_ACTIVITIES), where('listingId', '==', this.id))
    const querySnapshot = await getDocs(queryRef)
    const activityPromises = querySnapshot.docs.map(async (doc) => {
      const activity = new Activity(doc.id)
      await activity.fetch()
      return activity
    })
    const activities = await Promise.all(activityPromises)
    return activities
  }

  async getCorrespondingShifts () {
    const queryRef = query(collection(db, FB_SHIFTS), where('listingId', '==', this.id))
    const querySnapshot = await getDocs(queryRef)
    const shifts = []
    querySnapshot.forEach(async (doc) => {
      const shift = new Shift(doc.id)
      shift.fetch()
      shifts.push(shift)
    })
    return shifts
  }

  async getCorrespondingActiveShifts () {
    const curDate = new Date()
    const queryRef = query(collection(db, FB_SHIFTS), where('listingId', '==', this.id), where('isActive', '!=', false))
    const querySnapshot = await getDocs(queryRef)
    const shiftPromises = []
    querySnapshot.forEach((doc) => {
      const shift = new Shift(doc.id)
      const shiftPromise = shift.fetch().then(() => {
        if (checkValidSlot(shift.start, shift.end, shift.date)) {
          return shift
        }
      })
      shiftPromises.push(shiftPromise)
    })

    const shifts = await Promise.all(shiftPromises)
    return shifts.filter(Boolean) // Remove any undefined values
  }

  async getFirstShiftDate () {
    const queryRef = query(collection(db, FB_SHIFTS), where('listingId', '==', this.id))
    const querySnapshot = await getDocs(queryRef)
    if (querySnapshot.size === 0) {
      return ''
    }
    const shiftsPromises = querySnapshot.docs.map(async (doc) => {
      const shift = new Shift(doc.id)
      await shift.fetch()
      return shift
    })
    const shiftsData = await Promise.all(shiftsPromises)
    if (shiftsData.length > 0) {
      const firstShift = new Shift(shiftsData[0].id)
      await firstShift.fetch()
      if (firstShift.date) {
        return firstShift.date
      }
    } else {
      return ''
    }
  }

  async getUnreviewedWorkerActivities () {
    // activities whose ratingId is missing and whose status is at least receive payment
    const queryRef = query(collection(db, FB_ACTIVITIES), where('listingId', '==', this.id), where('storeRatingId', '==', null), where('checkOut', '!=', null), orderBy('checkOut', 'desc'))
    const querySnapshot = await getDocs(queryRef)
    const activityPromises = querySnapshot.docs.map(async (doc) => {
      const activity = new Activity(doc.id)
      await activity.fetch()
      return activity
    })
    const activities = await Promise.all(activityPromises)
    return activities
  }

  get attire () {
    return this._attire
  }

  get requirement () {
    return this._requirement
  }

  get jobClosingTime () {
    return this._jobClosingTime
  }

  get category () {
    return this._category
  }

  get selectedTags () {
    return this._selectedTags
  }

  get createdAt () {
    return this._createdAt
  }

  get dates () {
    return this._dates
  }

  get employerId () {
    return this._employerId
  }

  get employerName () {
    return this._employerName
  }

  get isActive () {
    return this._isActive
  }

  get lat () {
    return this._lat
  }

  get lng () {
    return this._lng
  }

  get latestApplicationDate () {
    return this._latestApplicationDate
  }

  get photo () {
    return this._photo
  }

  get salary () {
    return this._salary
  }

  get streetName () {
    return this._streetName
  }

  get addressDetail () {
    return this._addressDetail
  }

  get transport () {
    return this._transport
  }

  get trigram () {
    return this._trigram
  }

  get locationInfo () {
    return this._locationInfo
  }

  get updatedAt () {
    return this._updatedAt
  }

  get workerIds () {
    return this._workerIds
  }

  get settings () {
    return this._settings
  }

  get listingColor () {
    return this._listingColor
  }

  openMap = (event) => {
    event.stopPropagation() // Don't open the listing when clicking on the map
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${this._lat},${this._lng}`
    window.open(mapsUrl, '_blank')
  }

  async deleteListing () {
    const now = new Date()
    const listingRef = doc(db, FB_LISTINGS, this.id)
    await updateDoc(listingRef, {
      isActive: false
    })
    const shifts = await this.getCorrespondingShifts()
    await shifts.forEach(async shift => {
      await shift.handleDelete(now)
    })
    const activities = await this.getCorrespondingActivities()
    await activities.forEach(async activity => {
      await activity.handleShiftDeleted(now)
    })
  }

  async changeSalary (salary) {
    this._salary = salary
    this._updatedAt = new Date()
    const docRef = doc(db, FB_LISTINGS, this.id)
    await updateDoc(docRef, { salary })
  }

  async changeColor (color) {
    this._listingColor = color
    this._updatedAt = new Date()
    const docRef = doc(db, FB_LISTINGS, this.id)
    await updateDoc(docRef, { listingColor: color })
  }
}
