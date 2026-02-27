
# 🎁 Gift Moments (formerly Time Capsule)

> **Turn every gift into a perfectly timed surprise**

**Gift Moments** reimagines the time capsule: every capsule is now a "gift moment"—a meaningful present, message, or memory, boxed and delivered at just the right time. Instead of simply storing memories for the future, Gift Moments lets you create, schedule, and deliver gifts, surprises, and heartfelt messages that become treasured moments for your loved ones.

##   What is a Gift Moment?

A Gift Moment is more than a time capsule. It’s a digital box for your most thoughtful gifts—photos, videos, letters, or surprises—delivered on birthdays, anniversaries, or any special date. Each capsule is a promise: “I remembered you, and I planned this just for you.”

- **Preserve and deliver gifts for any occasion**
- **Send love, encouragement, or surprises to the future**
- **Celebrate milestones with perfectly timed moments**
- **Build a tradition of thoughtful giving across years**

## ✨ Why Gift Moments?

Life’s best gifts are about timing and meaning. Gift Moments helps you:
- **Never forget a special date or idea for a gift**
- **Make every celebration more personal and memorable**
- **Create a legacy of love, wisdom, and joy for friends and family**


---


## 🌟 **What You Can Do with Gift Moments**

### 👨‍👩‍👧‍👦 **For Families & Friends**
- **Birthday Surprises**: Schedule a video, letter, or photo to arrive on a loved one’s birthday
- **Anniversary Gifts**: Create a tradition of annual gift moments for your partner
- **Family Legacy**: Record stories, recipes, or wisdom to be delivered to future generations
- **Milestone Celebrations**: Send encouragement or congratulations for graduations, new jobs, or big life events

### 💝 **For Personal Growth**
- **Future Self Messages**: Send encouragement or reminders to your future self
- **Goal Achievement**: Motivate yourself with scheduled gift moments for reaching milestones
- **Reflection & Growth**: Archive your thoughts and see how you’ve grown

###   **For Special Occasions**
- **Graduation Gifts**: Messages and memories that unlock on graduation day
- **Holiday Surprises**: Deliver a holiday greeting or family tradition at just the right time
- **Memorial Tributes**: Honor loved ones with messages delivered on meaningful dates

### 🏢 **For Organizations & Teams**
- **Team Building**: Celebrate team wins with scheduled gift moments
- **Company Anniversaries**: Mark milestones with messages from leadership
- **Community Archives**: Preserve and share local history or culture as gift moments


## ✨ **The Magic of Gift Moments**

### 🔮 **Perfectly Timed Delivery**
Schedule your gift moments for birthdays, anniversaries, or any special date. Your surprise is delivered exactly when it matters most.

### 📱 **Rich Media Gifts**
Combine photos, videos, audio, and heartfelt messages into multimedia gift experiences.

### 🌍 **Global & Multilingual**
Available in 6 languages, accessible from any device, anywhere in the world.

### 🔐 **Bank-Level Security**
Your gifts and memories are protected with advanced encryption and privacy controls.

### 👥 **Shared Experiences**
Send gift moments to one or many recipients, each with their own delivery schedule and access.

### 📊 **Gift Timeline**
Visualize your journey of giving and receiving through an interactive timeline of gift moments.


## 🚀 **Quick Start**

Gift Moments consists of two main components working together to provide a seamless experience:


### 🌐 **Web Application** (`tc-app/`)
Modern, responsive web interface for creating, scheduling, and managing your gift moments.

### ⚙️ **Backend Service** (`tc-be/`)
Robust, secure server infrastructure handling data storage, delivery scheduling, and user management.

### **Getting Your Gift Moments Running**

```bash
# Clone the repository
git clone <repository-url>
cd time-caps

# Option 1: Quick Docker Setup (Recommended)
cd Docker
docker-compose up -d

# Option 2: Manual Development Setup
# Start Backend
cd tc-be
npm install
npm run start:dev

# Start Frontend (in another terminal)
cd tc-app  
npm install
npm start

# Access your Gift Moments at http://localhost:4200
```

## 🏗️ **Project Architecture**

Gift Moments is built as a modern full-stack application designed for scalability, security, and user experience:


### **Frontend Application** (`tc-app/`)
- **Modern Web Framework**: Built with Angular 19 for performance
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live notifications and dynamic content
- **Intuitive Interface**: Effortless creation and scheduling of gift moments

### **Backend Service** (`tc-be/`)
- **Robust API**: RESTful services built with NestJS
- **Secure Data Storage**: Advanced architecture with user isolation
- **Scheduled Delivery**: Intelligent system for time-based gift delivery
- **Authentication & Security**: Multi-layer security and encryption

### **Key Technical Highlights**
- **Scalable Architecture**: Monorepo structure for efficient development and deployment
- **Docker Support**: Containerized deployment for easy setup and scaling
- **Database Flexibility**: Support for both MySQL and SQLite for different deployment scenarios
- **International Ready**: Built-in support for multiple languages and regions
- **Cloud Ready**: Designed for deployment on modern cloud platforms


## 🌍 **Supported Languages**

Gift Moments speaks your language with full internationalization support:
- 🇺🇸 **English** - Global standard
- 🇪🇸 **Spanish** - Español 
- 🇫🇷 **French** - Français
- 🇮🇹 **Italian** - Italiano
- 🇬🇪 **Georgian** - ქართული
- 🇷🇺 **Russian** - Русский


## 📱 **User Experience**

### **Dashboard**
Your personal Gift Moments mission control featuring:
- Timeline view of all your gift moments
- Quick access to create new gifts
- Notification center for upcoming deliveries
- Personal statistics and insights

### **Gift Creation**
Intuitive tools for building your gift moments:
- Drag-and-drop media upload
- Rich text editor for messages
- Flexible scheduling options
- Recipient management system

### **Gift Library**
Centralized management for all your content:
- Advanced search and filtering
- Organized collections and categories
- Preview capabilities for all media types
- Batch operations for efficiency

### **Delivery Experience**
When the time comes, recipients enjoy:
- Beautiful presentation of your gift content
- Multimedia playback capabilities
- Option to create response gift moments
- Sharing tools for special moments

## 🔐 **Privacy & Security**


Your gifts and memories are precious, and we protect them accordingly:

- **Data Encryption**: All content encrypted both in transit and at rest
- **Individual Isolation**: Each user's data stored in separate, secure containers
- **Access Controls**: Granular permissions and authentication systems
- **GDPR Compliance**: Full compliance with international privacy standards
- **Backup & Recovery**: Redundant storage systems ensure your memories are never lost
- **Transparent Policies**: Clear, understandable privacy and security documentation

## 🛠️ **For Developers**

### **Development Environment Setup**
```bash
# Full development setup with Docker
cd Docker
docker-compose -f docker-compose.dev.yml up

# Manual setup for active development
# Terminal 1: Backend
cd tc-be && npm install && npm run start:dev

# Terminal 2: Frontend  
cd tc-app && npm install && npm start
```

### **Project Structure**
```
time-caps/
├── tc-app/          # Angular frontend application
├── tc-be/           # NestJS backend service  
├── Docker/          # Containerization configs
├── docs/            # Project documentation
└── README.md        # This file
```

### **Development Resources**
- **Frontend Documentation**: [`tc-app/.github/docs/`](tc-app/.github/docs/)
- **Backend Documentation**: [`tc-be/.github/docs/`](tc-be/.github/docs/)
- **API Documentation**: Available via OpenAPI/Swagger
- **Development Guidelines**: Comprehensive guides for contributing


## 🌟 **Real-World Impact**

Gift Moments isn't just an application—it's a bridge between moments. Here's how people are using it to create meaningful connections across time:


### **Personal Stories**
- A grandmother recording bedtime stories for grandchildren she may never meet
- A recent graduate sending wisdom to their future self starting their career
- Parents creating yearly birthday gift moments for their children to discover as they grow
- A couple documenting their love story to open on their 50th wedding anniversary


### **Community Impact**
- Schools creating graduation gift moments for class reunions
- Local communities preserving historical moments for future generations
- Support groups creating encouragement gift moments for members facing challenges
- Families separated by distance staying connected across time zones and years


## 🚀 **Getting Started Journey**

### **Your First Gift Moment in 5 Minutes**

1. **Sign Up** - Create your secure account
2. **Create** - Upload a photo and write a message
3. **Schedule** - Choose when it should be delivered
4. **Recipients** - Decide who will receive it (yourself or others)
5. **Send to Future** - Watch as your gift moment joins your timeline

### **Growing Your Gift Moments Experience**

- **Week 1**: Create a simple message to yourself for next month
- **Month 1**: Build a multimedia gift moment for a special occasion
- **Month 3**: Organize your content library and create themed collections
- **Year 1**: Establish regular gift moment traditions with family and friends

## 💡 **Inspiration & Ideas**

### **Personal Development**
- Monthly reflection capsules to track your growth
- Goal-setting messages to motivate your future self
- Achievement celebrations to unlock on anniversaries
- Learning journey documentation for skills you're developing


### **Relationships**
- Anniversary gift moments with yearly messages for your partner
- Friendship gift moments for milestone celebrations
- Parent-to-child wisdom shared across the years
- Memory exchanges with long-distance friends and family


### **Legacy Building**
- Family recipe collection with stories behind each dish
- Professional advice from your career journey
- Life lesson documentation for future generations
- Cultural tradition preservation for your heritage

## 🤝 **Community & Support**


### **Join the Gift Moments Community**
- Share your gift moment ideas and inspiration
- Connect with others preserving memories and gifts across time
- Discover creative ways to use time-based gifting
- Get support for technical questions and feature requests


### **Contributing to Gift Moments**
We welcome contributions from developers, designers, and users who want to help improve the platform:

1. **Code Contributions**: Check our development guidelines in the project documentation
2. **Translation Help**: Assist with internationalization for new languages
3. **Feature Ideas**: Share suggestions for improving the user experience
4. **Bug Reports**: Help us maintain quality by reporting issues
5. **Documentation**: Improve our guides and help resources

### **Development Documentation**
- **Frontend Guide**: [`tc-app/.github/docs/`](tc-app/.github/docs/) - Angular development patterns
- **Backend Guide**: [`tc-be/.github/docs/`](tc-be/.github/docs/) - NestJS architecture and APIs
- **Quick References**: Development cheat sheets and best practices
- **Project Management**: Current tasks and development roadmap


## 📄 **License & Legal**

Gift Moments is released under the MIT License, promoting open-source collaboration while protecting user privacy and data rights. See the LICENSE file for complete details.

---


## 🎁 **Start Your Gift Moments Journey Today**

> *"The best time to plant a tree was 20 years ago. The second best time is now."*  
> *The same is true for giving the perfect gift.*

**Gift Moments** transforms the way we think about time, memory, and connection. In a world where everything moves fast and moments slip away, we give you the power to slow down, preserve what matters, and send love and gifts across time.

Your future self is waiting. Your loved ones are waiting. Your gifts are waiting.

**What will you send to tomorrow?** 🚀

---

*Gift Moments - Where gifts and memories meet the future*
