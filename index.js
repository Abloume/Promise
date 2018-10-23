function Promise(fn) {
     var callbacks = [];
     var state = 'pending';
     var value = null;

     this.then = function(onFulfilled, onRejected) {
         return new Promise((resolve, reject) => {
             handle({
                 onFulfilled: onFulfilled || null,
                 onRejected: onRejected || null,
                 resolve: resolve,
                 reject : reject
             })
         })
     }

     function handle(callback) {
         if (state === 'pending') {
             callbacks.push(callback);
             return;
         }
         var cb = state === 'fulfilled' ? callback.onFulfilled : callback.onRejected;
         if (cb === null) {
             cb = state === 'resolve' ? callback.resolve : callback.reject;
             cb(value);
             return;
         }
         var ret = cb(value);
         callback.resolve(ret);
     }

     function resolve(newValue) {
         if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
             var then = newValue.then;
             if (typeof then === 'function') {
                 then.call(newValue, resolve, reject);
                 return;
             }
         }
         state = 'fulfilled';
         value = newValue;
         execute();
     }

     function reject(reason) {
         state = 'rejected';
         value = reason;
         execute();
     }

     function execute() {
         setTimeout(() => {
             callbacks.forEach(callback => {
                 handle(callback);
             })
         }, 0)
     }

     fn(resolve, reject);
}