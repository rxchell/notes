import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase/Firebase'
import { FB_ACTIVITIES, FB_LISTINGS, FB_SHIFTS, EMAIL_FLEXII_ADDR } from '../reference'
import { createTimestampFromDateAndStart, calculateCancellationFee } from '../listings/ListingUtils'
import Listing from './firebase_listings'
import Activity from './firebase_activities'
import Store from './firebase_store'
import { generateId } from '../utilities/generateTrigram'
import { Mail } from '../models/firebase_mails'
import Worker from './firebase_worker'

export default class Shift {
  constructor (id) {
    this.id = id
  }

  async fetch () {
    const docRef = doc(db, FB_SHIFTS, this.id)
    const docSnap = await getDoc(docRef)
    const data = docSnap.data()
    this._date = data.date || null
    this._start = data.start || data.startTime
    this._end = data.end || data.endTime
    this._breakTime = data.breakTime || null
    this._listingId = data.listingId || null
    this._vacancies = data.vacancies || 0
    this._workerIds = data.workerIds || null
    this._employerId = data.employerId || null
    this._latestApplicationDate = data.latestApplicationDate || null
    this._insurance = data.insurance || false
    this._isActive = data.isActive || true
  }

  async getCorrespondingListing () {
    const listing = new Listing(this._listingId)
    await listing.fetch()
    return listing
  }

  async getCorrespondingActivity () {
    const queryRef = query(collection(db, FB_ACTIVITIES), where('shiftId', '==', this.id))
    const querySnapshot = await getDocs(queryRef)
    const activities = []
    querySnapshot.forEach(doc => {
      const activity = new Activity(doc.id)
      activities.push(activity)
    })
    activities.forEach(async activity => {
      await activity.fetch()
    })
    return activities
  }

  async getHourlySalary () {
    const listing = new Listing(this._listingId)
    await listing.fetch()
    return listing.salary
  }

  get date () {
    return this._date
  }

  get start () {
    return this._start
  }

  get end () {
    return this._end
  }

  get breakTime () {
    return this._breakTime
  }

  get listingId () {
    return this._listingId
  }

  get vacancies () {
    return this._vacancies
  }

  get workerIds () {
    return this._workerIds
  }

  get employerId () {
    return this._employerId
  }

  get latestApplicationDate () {
    return this._latestApplicationDate
  }

  get insurance () {
    return this._insurance
  }

  async change ({ vacancies, workerIds, start, end, breakTime, date, employerId, insurance, listingId, latestApplicationDate }) {
    if (vacancies !== undefined) {
      this._vacancies = vacancies
    }

    if (workerIds !== undefined) {
      this._workerIds = workerIds
    }

    if (start !== undefined) {
      this._start = start
    }

    if (end !== undefined) {
      this._end = end
    }

    if (breakTime !== undefined) {
      this._breakTime = breakTime
    }

    if (date !== undefined) {
      this._date = date
    }

    if (employerId !== undefined) {
      this._employerId = employerId
    }

    if (insurance !== undefined) {
      this._insurance = insurance
    }

    if (listingId !== undefined) {
      this._listingId = listingId
    }

    if (latestApplicationDate !== undefined) {
      this._latestApplicationDate = latestApplicationDate
    }
    return this
  }

  async update () {
    const docRef = doc(db, FB_SHIFTS, this.id)
    await updateDoc(docRef, {
      vacancies: this._vacancies,
      workerIds: this._workerIds,
      start: this._start,
      end: this._end,
      breakTime: this._breakTime,
      latestApplicationDate: createTimestampFromDateAndStart(this._date, this._start),
      date: this._date,
      employerId: this._employerId,
      insurance: this._insurance,
      isActive: this._isActive
    })
    return true
  }

  async handleDelete (busineeCancelDate) {
    await this.fetch()
    this._isActive = false
    this._vacancies = 0
    await this.update()
    await this.sendBusinessCancelEmailToStore(busineeCancelDate)
  }

  async sendBusinessCancelEmailToStore (busineeCancelDate) {
    const store = new Store(this._employerId)
    await store.fetch()
    const listing = new Listing(this.listingId)
    await listing.fetch()

    const workerNameList = []
    let cancellationFee = 0

    if (this._workerIds.length > 0) {
      this._workerIds.forEach(async workerId => {
        const worker = new Worker(workerId)
        await worker.fetch()
        workerNameList.push(worker.fullName)
      })
      cancellationFee = calculateCancellationFee(busineeCancelDate, this, listing)
    }

    const mail = new Mail(generateId())
    await mail.createEmail(
      store.email,
      EMAIL_FLEXII_ADDR,
      EMAIL_FLEXII_ADDR,
      'Confirmed the cancellation',
      `We confirmed you had canceled the shift on ${this._date}.
       The cancellation fee will be included in the next bill. <br>
       Worker Name: ${workerNameList.join(',')} <br>
       Date: ${this._date} ${this._start}-${this._end} <br>
       Salary: S$${listing.salary}/h <br>
       Business Cancellation fee: S$${cancellationFee}  <br>
       Thanks, <br>
       Flexii Team`
    )
  }

  async handleRemoval (workerId) {
    await this.fetch()
    if (this._workerIds.includes(workerId)) {
      this._vacancies += 1
      this._workerIds = this._workerIds.filter(id => id !== workerId)
      await this.update()
    }
  }
}
