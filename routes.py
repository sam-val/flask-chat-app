from chat import app, db
from flask import render_template, request, Markup, flash, redirect, url_for
from flask_login import login_required, logout_user, login_user, current_user
from chat.models import User
from chat.forms import  LoginForm, SignupForm

title = "No title"

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/',methods=['POST', 'GET'])
@app.route('/index', methods=['POST', 'GET'])
@login_required
def index():
    title = "Index"
    return render_template('index.html')


@app.route('/login', methods=['POST', 'GET'])
def login():
    form = LoginForm()
    title = "Login Page"
    if form.validate_on_submit():
        try: 
            user = User.query.filter_by(username=form.username.data).first()
            if user is None or not user.check_password(form.password.data):
                message = Markup(f"Invalid Username or Password.")
                flash(message)
                return redirect(url_for('login'))
            else:
                login_user(user=user, remember=form.remember_me.data)
                return redirect(url_for('index'))
        except Exception as e:
            message = Markup(f"Error updating task: {e}")
            flash(message)
            return redirect(url_for('login'))
    
    return render_template("login.html", title=title, form=form) 

@app.route('/signup', methods=['POST', 'GET'])
def signup():
    if not current_user.is_anonymous:
        return redirect(url_for('index'))

    form = SignupForm()
    title = "Sign Up Page"
    success = False
    message = ""
    if form.validate_on_submit():
        try:
            if form.password.data != form.re_password.data:
                raise ValueError("Passwords do not match!")

            if User.query.filter_by(username=form.username.data).first():
                raise ValueError("Username exists!")
                
            email = form.email.data if form.email.data.strip() != "" else None
            new_user = User(username=form.username.data, email=email)          
            new_user.set_password(form.password.data)

            db.session.add(new_user)
            db.session.commit()
            success = True
            message+= "Sign Up Successful, Please Log In"
        except ValueError as e:
            message+= f'{e.args[0]}'
        except Exception as e:
            message+= f" {e}"
            db.session.rollback()
        finally:
            flash(message)
            return redirect(url_for('login')) if success else redirect(url_for('signup'))
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f"{field}: {error}")
    
    return render_template("signup.html", title=title, form=form)


@app.before_request
def before_request():
    pass