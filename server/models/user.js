const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  // name: {
  //   type: String,
  //   required: true
  // },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isCustomer: {
    type: Boolean,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  let newPrice = product.price;
  const updatedCartItems = [...this.cart.items];

  if(cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    newPrice = this.cart.items[cartProductIndex].price + product.price;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
    updatedCartItems[cartProductIndex].price = newPrice;

  } else {
    updatedCartItems.push({ 
      productId: product._id, 
      quantity: newQuantity,
      price: newPrice
    })
  }

  const updatedCart = { 
    items: updatedCartItems 
  };

  this.cart = updatedCart;
  return this.save();

}

userSchema.methods.removeFromCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 0;
  let newPrice = 0;
  let updatedCartItems = [...this.cart.items];

  if(cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity - 1;
    newPrice = this.cart.items[cartProductIndex].price - product.price;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
    updatedCartItems[cartProductIndex].price = newPrice;
  }

  if(newQuantity === 0) {
    const productId = product._id;
    updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();

  } else {
  
    const updatedCart = { 
      items: updatedCartItems 
    };
  
    this.cart = updatedCart;
    return this.save();
  }
};

userSchema.methods.deleteFromCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 0;
  let newPrice = 0;
  let updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    updatedCartItems[cartProductIndex].quantity = newQuantity;
    updatedCartItems[cartProductIndex].price = newPrice;
  }

  if (newQuantity === 0) {
    const productId = product._id;
    updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
  } else {
    const updatedCart = {
      items: updatedCartItems,
    };

    this.cart = updatedCart;
    return this.save();
  }
};


userSchema.methods.clearCart = function() {
  this.cart = {items: []};
  return this.save();
}


module.exports = mongoose.model('User', userSchema);


// const mongodb = require('mongodb');
// const ObjectId = mongodb.ObjectId;
// const getDb = require('../utils/database').getDb;

// class User {
//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }

//     save() {
//         const db = getDb();
//         return db
//           .collection('users')
//           .insertOne(this);
//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(i => {
//             return i.productId;
//         });

//         return db
//           .collection('products')
//           .find({_id: {$in: productIds}})
//           .toArray()
//           .then(products => {
//             return products.map(p => {
//                 return {
//                     ...p,
//                     quantity: this.cart.items.find(i => {
//                       return i.productId.toString() === p._id.toString();
//                     }).quantity
//                 }
//             })
//           });
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         });

//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         if(cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({ 
//               productId: new ObjectId(product._id), 
//               quantity: newQuantity 
//             })
//         }


//         const updatedCart = { 
//           items: updatedCartItems 
//         };

//         const db = getDb();
//         return db
//           .collection('users')
//           .updateOne(
//             { _id: new ObjectId(this._id)},
//             { $set: {cart: updatedCart}}
//           );
//     }

//     deleteItemFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();
//         });

//         const db = getDb();
//         return db
//           .collection('users')
//           .updateOne(
//             { _id: new ObjectId(this._id)},
//             { $set: {cart: {items: updatedCartItems} } }
//           );
//     }

//     getOrders() {
//         const db = getDb();
//         return db
//           .collection('orders')
//           .find({'user._id': new ObjectId(this._id)})
//           .toArray();
//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCart().then(products => {
//           const order = {
//             items: products,
//             user: {
//               _id: new ObjectId(this._id),
//               name: this.name
//             }
//           };
//           return db
//             .collection('orders')
//             .insertOne(order)
//         })
//         .then(result => {
//           this.cart = {items: []};
//           return db
//             .collection('users')
//             .updateOne(
//             { _id: new ObjectId(this._id)},
//             { $set: {cart: {items: []} } }
//           );
//         });
        
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db
//           .collection('users')
//           .findOne({_id: new ObjectId(userId)})
//           .then(user => {
//             console.log(user);
//             return user;
//           })
//           .catch(err => {
//             console.log(err);
//           });

//     }
// }

// module.exports = User;