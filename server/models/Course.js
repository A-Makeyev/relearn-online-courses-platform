const mongoose = require("mongoose")


const LectureSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  video_url: String,
  public_id: String,
  preview: { type: Boolean, default: false }
})

const CourseSchema = new mongoose.Schema({
  instructorId: String,
  instructorName: String,
  date: Date,
  title: { type: String, trim: true, required: true },
  category: { type: String, index: true },
  level: String,
  language: String,
  subtitle: String,
  description: String,
  image_url: String,
  public_id: String,
  welcomeMessage: String,
  price: { type: Number, min: 0, default: 0 },
  objectives: String,
  isPublished: { type: Boolean, default: true },
  curriculum: [LectureSchema],
  students: [
    {
      studentId: String,
      studentName: String,
      studentEmail: String,
      paidAmount: String
    }
  ],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 }
}, { timestamps: true })

CourseSchema.index({ averageRating: -1 })
CourseSchema.index({ reviewCount: -1 })
CourseSchema.index({ date: -1 })

module.exports = mongoose.model('Course', CourseSchema)
