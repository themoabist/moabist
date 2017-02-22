(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var list = new Array
var total = 0
var length_div
var items_div
var total_div
module.exports.init = function(l_div,i_div,t_div){
	length_div = l_div
	items_div = i_div
	total_div = t_div
	document.getElementById(length_div).innerHTML = list.length
}

module.exports.add = function(name,price_cents){
	list.push({name:name,price:price_cents})
	total = total + price_cents
	document.getElementById(length_div).innerHTML = list.length
	redraw()
}
	
module.exports.remove = function(index){
	remove_by_index(index)
}

function remove_by_index(index){
	var removed = list.splice(index,1);
	total = total - removed[0].price;
	document.getElementById(length_div).innerHTML = list.length
	redraw()
}

function redraw(){
	html_string = ""
	for(var i =0; i<list.length; i++){
		html_string += "<tr><td>" + list[i].name + "</td><td>$" + list[i].price.toFixed(2)/100 + "</td><td><button type='button' class='btn btn-link' id='stripe_item_cindex_" + i + "' data-cindex="+ i +">remove</button></td></div></tr>"
	}
	document.getElementById(items_div).innerHTML = html_string
	document.getElementById(total_div).innerHTML = "$" + total.toFixed(2)/100
	for(var i =0; i<list.length; i++){
		document.getElementById("stripe_item_cindex_" + i).onclick = remove_onclick
	}
}

function remove_onclick(){
	var temp = this.dataset.cindex
	remove_by_index(temp)
}


module.exports.read = function(){
	return list
}

module.exports.pretty_total = function(){
	return total.toFixed(2)/100
}

module.exports.charge_amount = function(){
	return total
}

function format_summary(){
	var html_string =""
	for(var i =0; i<list.length; i++){
		html_string += list[i].name + ": $" + list[i].price.toFixed(2)/100 + "<br>"
	}
	html_string += "Total: $" + total.toFixed(2)/100 + "<br>"
	return html_string
}
module.exports.summary = format_summary

module.exports.store_local = function(){
	localStorage.setItem("cart",JSON.stringify(list))
	localStorage.setItem("total",total)
	localStorage.setItem("summary",format_summary())
}



},{}],2:[function(require,module,exports){

//load script from url
var urls_loaded = new Array();
module.exports.load_from_url = function(url, callback){
	for(i=0;i<urls_loaded.length;i++){
		if(url == urls_loaded[i]){
			console.log(url+ " already loaded skipping load.")
			callback()
			return
		}
	}
	
    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
	urls_loaded.push(url)
}

},{}],3:[function(require,module,exports){

function esubscriber_instance(){	
	var reference = {
		handlers: new Array(),
		check_exist: check_exist,
		subscribe: subscribe,
		unsubscribe: unsubscribe,
		trigger: trigger
	}

	return reference
}

function check_exist(fn, arr){
	for(var i =0; i<this.handlers.length; i++){ // check for duplicate subscriptions
		if(fn == this.handlers[i]){
			console.log("function already in array.")
			return true
		}
	}
	return false
}

function subscribe(fn) {
	if(this.check_exist(fn,this.handlers))
		return
	this.handlers.push(fn);
}

function unsubscribe(fn) {
    this.handlers = this.handlers.filter(
        function(item) {
            if (item !== fn) {
                return item;
            }
        }
    )
}

function trigger(args){
	for(var i =0; i<this.handlers.length; i++){
		this.handlers[i](args)
	}
}

module.exports.esubscriber = esubscriber_instance

},{}],4:[function(require,module,exports){
var post = require('./p0st')

module.exports.post = form_to_post
module.exports.post_unauth = form_to_post_unauth
module.exports.push = form_to_push
module.exports.set = form_to_set

function get_form_data(form){
	var elements= form.elements
	var to_submit = {}
	for (var i = 0; i < elements.length; i++){
		if(elements[i].type == "checkbox"){
			to_submit[elements[i].id] = elements[i].checked
		} else if((elements[i].type == "button")){
			//do nothing
		} else if((elements[i].type == "submit")){
			//do nothing
		}
		else{
			to_submit[elements[i].id] = elements[i].value
		}
	}
	return to_submit
}

function error_response(form){
	var div = document.createElement('div');
	div.innerHTML = '<div class="alert alert-danger fade show" role="alert">Add Failed</div>'
	form.appendChild(div)
	window.setTimeout(function(){this.remove();}.bind(div), 5000);
}
function success_response(form){
	var div = document.createElement('div');
	div.innerHTML = '<div class="alert alert-success fade show" role="alert">Added Successfully</div>'
	form.appendChild(div) 
	window.setTimeout(function(){this.remove();}.bind(div), 5000);
}


function form_to_post(form, url, onerror, onsuccess){
	var to_submit = get_form_data(form)
	post.post(url,to_submit,true).then(onsuccess()).catch(onerror())
	return false
}

function form_to_post_unauth(form, url, onerror, onsuccess){
	var to_submit = get_form_data(form)
	post.post_noid(url,to_submit).then(function(){
		success_response(form)
		onsuccess()}).catch(function(){
		error_response(form)
		onerror()})
	return false
}

function form_to_push(form, path, onerror, onsuccess){
	var to_submit = get_form_data(form)
	firebase.database().ref(path).push(to_submit, function(error){
		if(error){
			error_response(form)
			onerror(error)
			return false
		}
		success_response(form)
		onsuccess()
	})
	return false
}

function form_to_set(form, path, onerror, onsuccess){
	var to_submit = get_form_data(form)
	firebase.database().ref(path).set(to_submit, function(error){
		if(error){
			onerror(error)
		}
		onsuccess()
	})
	return false
}
},{"./p0st":8}],5:[function(require,module,exports){
var template = require("./l0g1n_template")
var es = require("./esubscriber")
var onlogin_event =  es.esubscriber()
var onlogout_event = es.esubscriber()
var onload_event = es.esubscriber()
var dlscr1pt = require("./dlscr1pt.js")
var config

module.exports.instance = function(config_instance){
	config = config_instance	
	var reference = new Object()
	reference.onlogin = onlogin_event
	reference.onload = onload_event
	reference.onlogout = onlogout_event
	reference.register = register_view
	reference.login = login_view
	reference.reset_email = reset_email
	reference.verify_email = verify_email
	reference.email = email
	dlscr1pt.load_from_url("https://www.gstatic.com/firebasejs/3.3.0/firebase.js",script_loaded_callback)
	return reference
}

function email(){
	return firebase.auth().currentUser.email
}

function script_loaded_callback(){
	firebase.initializeApp(config)
	firebase.auth().onAuthStateChanged( auth_callback, auth_error_callback)
	onload_event.trigger()
}

function register_view(div){
	document.getElementById(div).innerHTML = template.register_template
	document.getElementById("l0g1n_modal_facebook_login").onclick = facebook_login
	document.getElementById("l0g1n_modal_register").onclick = register
}

function login_view(div){
	document.getElementById(div).innerHTML = template.login_template
	document.getElementById("l0g1n_modal_login").onclick = login
	document.getElementById("l0g1n_modal_facebook_login").onclick = facebook_login
}

function init(){
	document.getElementById(pid).innerHTML = template.nav_template
	var modal = document.createElement("div");
	modal.innerHTML = template.modal_template
	document.body.appendChild(modal);
	document.getElementById("l0g1n_logout").onclick = logout
	document.getElementById("l0g1n_modal_login").onclick = login
	document.getElementById("l0g1n_modal_facebook_login").onclick = facebook_login
	document.getElementById("l0g1n_modal_register").onclick = register
	document.getElementById('l0g1n_verify').onclick = email_verification
	document.getElementById('l0g1n_reset').onclick = reset_email	
}

function login() {
	var email = document.getElementById('l0g1n_input_email').value
	var password = document.getElementById('l0g1n_input_password').value
	firebase.auth().signInWithEmailAndPassword(email, password).catch (function (error) {
		var errorCode = error.code
		var errorMessage = error.message
		console.log(error.message)
		show_alert(error.message)
	})
}

function register(){
	var email = document.getElementById('l0g1n_input_email').value
	var password = document.getElementById('l0g1n_input_password').value
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
		var errorCode = error.code
		var errorMessage = error.message
		console.log(error.message)
		show_alert(error.message)
	})
}

function reset_email(){
	var email = firebase.auth().currentUser.email
	firebase.auth().sendPasswordResetEmail(email).catch(function(error) {
		var errorCode = error.code
		var errorMessage = error.message
		console.log(error.message)
		show_alert(error.message)
	})
}

function verify_email(){
	firebase.auth().currentUser.sendEmailVerification().catch(function(error) {
		var errorCode = error.code
		var errorMessage = error.message
		console.log(error.message)
		show_alert(error.message)
	})
}

function logout(){
	firebase.auth().signOut()
}

function show_alert(error_string){
	document.getElementById('l0g1n_error').innerHTML = error_string
	document.getElementById('l0g1n_error_alert').style.display = "block"	
}

function auth_callback(user){
	if (user) {
		onlogin_event.trigger()
    } else {
		onlogout_event.trigger()
    }
}

function auth_error_callback(error){
	show_alert(error)
}


function facebook_login(){
	var provider = new firebase.auth.FacebookAuthProvider()
	provider.addScope('email')
	provider.addScope('user_friends')
	firebase.auth().signInWithPopup(provider).then(function(result) {
	  var credential = result.credential
	}, function(error) {
		var email = error.email
		var credential = error.credential
		show_alert(error.message)
		if (error.code === 'auth/account-exists-with-different-credential') {
			firebase.auth().fetchProvidersForEmail(email).then(function(providers) {
		})
	  }
	})	
}



},{"./dlscr1pt.js":2,"./esubscriber":3,"./l0g1n_template":6}],6:[function(require,module,exports){
 
var form_html = ' \
<div class="container" style="max-width:90%;padding-top:10px;padding-bottom:10px;"> \
	<form onsubmit="event.preventDefault(); return false;" > \
		<div class="form-group"> \
			<input type="email" id="l0g1n_input_email" class="form-control" placeholder="email@address.com" required autofocus> \
		</div> \
		<div class="form-group"> \
			<input type="password" id="l0g1n_input_password" class="form-control" placeholder="Password" required> \
		</div> \
		<button id="l0g1n_modal_login" class="btn btn-lg btn-outline-primary btn-block" type="submit">Sign in</button> \
		<div class="text-xs-center"> Or Use</div>\
		<button id="l0g1n_modal_facebook_login" class="btn btn-lg  btn-outline-primary btn-block" type="button">Facebook</button> \
		</div> \
		<div id="l0g1n_error_alert" class="alert alert-danger fade in" role="alert" style="display: none;margin: 0 auto; max-width:85%;margin-bottom:10px;"> \
			<div id="l0g1n_error"></div> \
		</div> \
	</form> \
</div> \
'

var form_register = ' \
<div class="container" style="max-width:90%;padding-top:10px;padding-bottom:10px;"> \
	<form onsubmit="event.preventDefault(); return false;" > \
		<div class="form-group"> \
			<input type="email" id="l0g1n_input_email" class="form-control" placeholder="email@address.com" required autofocus> \
		</div> \
		<div class="form-group"> \
			<input type="password" id="l0g1n_input_password" class="form-control" placeholder="Password" required> \
		</div> \
		<button id="l0g1n_modal_register" class="btn btn-lg  btn-outline-primary btn-block" type="button">Register</button> \
		<div class="text-xs-center"> Or Use</div>\
		<button id="l0g1n_modal_facebook_login" class="btn btn-lg  btn-outline-primary btn-block" type="button">Facebook</button> \
		</div> \
		<div id="l0g1n_error_alert" class="alert alert-danger fade in" role="alert" style="display: none;margin: 0 auto; max-width:85%;margin-bottom:10px;"> \
			<div id="l0g1n_error"></div> \
		</div> \
	</form> \
</div> \
'
exports.register_template = form_register
exports.login_template = form_html

exports.nav_template=' \
<form class="form-inline"> \
		<div class="btn-group" id="l0g1n_actions" style="visibility: hidden;">\
			<div class="btn  btn-outline-primary" >\
				<div id="l0g1n_user_email" class="text-muted hidden-sm-down"></div><div class="hidden-md-up">&#9776;</div>\
				<a id="l0g1n_verify" class="text-danger" href="#" style="display: none;">Send Verification Email</a>\
			</div>\
			<button type="button" class="btn  btn-outline-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>\
			<div class="dropdown-menu">\
			<a class="dropdown-item" href="#" id="l0g1n_logout">Logout</a>\
			<a class="dropdown-item" href="#" id="l0g1n_reset">Reset Password</a>\
			</div>\
		</div>\
		<button id="l0g1n_login" class="btn  btn-outline-primary" type="button" data-toggle="modal" data-target="#login_modal" >Login</button> \
</form> \
 '
 
exports.modal_template=' \
<div class="modal fade" id="login_modal" tabindex="-1" role="dialog" aria-labelledby="l0g1n_modal" aria-hidden="true"> \
	<div class="modal-dialog " role="document"> \
		<div class="modal-content"> \
			<div class="modal-header"> \
				<div class="text-xs-center text-primary"> Login \
					<button id="l0g1n_modal_close" type="button" class="close" data-dismiss="modal" aria-label="Close"> \
					<span aria-hidden="true">&times;</span> \
					</div>\
				</button> \
			</div> ' +
			form_html + 
		'</div> \
	</div> \
</div>'

},{}],7:[function(require,module,exports){
(function (global){
var l0g1n = require("./l0g1n.js")
var str1p3 = require("./str1p3.js")
var f0rm = require("./f0rm.js")

global.moabist = {l0g1n:l0g1n,str1p3:str1p3,f0rm:f0rm}

var config = {
	apiKey: "AIzaSyATn4gQLHGHtZPqQWsI1vw39BJcKnnKcfE",
	authDomain: "moabist.firebaseapp.com",
	databaseURL: "https://moabist.firebaseio.com",
	storageBucket: "moabist.appspot.com",
	messagingSenderId: "163901579102"
}

function auto_login(){
	global.login = l0g1n.instance(config)
}
auto_login()
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./f0rm.js":4,"./l0g1n.js":5,"./str1p3.js":9}],8:[function(require,module,exports){
module.exports.init = function(){}
module.exports.post = post_promise
module.exports.post_noid = post_unauth

function add_base_url(url){
	if(url.includes(":"))
		return url
	else
		return (window.location.origin + url)
}

// generic post
function post_promise(url,data,new_token){
	return new Promise(
		function (resolve,reject){
			url = add_base_url(url)
			firebase.auth().currentUser.getToken(new_token).then(function(idToken){	
				var req = new XMLHttpRequest();
				req.open("POST", url , true)
				req.setRequestHeader('Content-Type','application/json; charset=UTF-8')
				req.setRequestHeader('X-token',idToken)
				var json_data = JSON.stringify(data)
				req.send(json_data)
				req.onloadend = function (){
					if (req.status == 200){
						resolve(JSON.parse(this.responseText))
					}
					else{
						reject(req.status)
					}
				}
			}).catch(function(error){
				reject(error)
			})
		}
	)
}
///
function post_unauth(url,data){
	return new Promise(
		function (resolve,reject){
			url = add_base_url(url)
			var req = new XMLHttpRequest();
			req.open("POST", url , true)
			req.setRequestHeader('Content-Type','application/json; charset=UTF-8')
			var json_data = JSON.stringify(data)
			req.send(json_data)
			req.onloadend = function (){
				if (req.status == 200){
					resolve(JSON.parse(this.responseText))
				}
				else{
					reject("Url rejected post.")
				}
			}
		}
	)
}

},{}],9:[function(require,module,exports){
var template = require("./str1p3_template")
var c4rt = require("./c4rt.js")
var c_id
var t_id 
module.exports.instance = function(collapse_id, toggle_id){
	c_id = collapse_id
	t_id = toggle_id
	init()
	var st_reference = {
		add_item: add,
	}
	return st_reference
}

function init(){
	document.getElementById(c_id).innerHTML = '<div id="str1p3_main"></div>' 
	document.getElementById('str1p3_main').innerHTML = template.stripe_collapse
	document.getElementById(t_id).innerHTML = template.stripe_toggle
	document.getElementById('str1p3_checkout_button').onclick = stripe_onclick
	c4rt.init('str1p3_item_count','str1p3_cart_items','str1p3_total_pretty');
}
function stripe_onclick() {
	var charge_amount_cents = c4rt.charge_amount()
	c4rt.store_local()
	window.location.href="checkout.html"
}

function add(name,cents){
	c4rt.add(name,cents)
}

},{"./c4rt.js":1,"./str1p3_template":10}],10:[function(require,module,exports){

exports.stripe_toggle = ' \
  <button type="button" style="width:65px;" class="btn btn-outline-primary" data-toggle="collapse" href="#str1p3_collapse" aria-expanded="false" aria-controls="str1p3_collapse" > \
	<span class="row" >\
			<img src="img/checkout.svg" class="pl-2 float-left pr-0" alt="checkout toggle">\
			<div id="str1p3_item_count" class="pl-2 pr-2 float-right">0</div>\
	</span>\
  </button> \
'

exports.stripe_collapse = ' \
<div id="str1p3_collapse" class="collapse">\
	<br>\
	<div id="str1p3_scroll" class="card  text-center">\
		<div class="card-header" >\
			<div class="text-center">Cart Items</div> \
		</div> \
		<div class="card-block"> \
			<table class="table table-striped">\
				<tbody id="str1p3_cart_items">\
						<tr><td></td><td>No items in cart.</td><td></td></tr>\
				</tbody> \
			</table> \
			<button id="str1p3_checkout_button" class="btn btn-primary" href="#" >Checkout Now <div id="str1p3_total_pretty">$0.00</div></button> \
		</div>\
	</div>\
	<br>\
</div>\
'
 //<thead ><tr><th>Name</th><th>Price</th><th>Delete</th></tr></thead>\
},{}]},{},[7]);
