from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, BooleanField, PasswordField
from wtforms.validators import DataRequired, EqualTo, Email, ValidationError
from chat.models import User


class LoginForm(FlaskForm):
    username = StringField(label="Username", validators=[DataRequired()])
    password = PasswordField(label="Password", validators=[DataRequired()])
    remember_me = BooleanField(label="Remember Me")
    submit = SubmitField(label="Sign In")

class SignupForm(FlaskForm):
    username = StringField(label="Username", validators=[DataRequired()])
    email = StringField(label="Email", validators=[Email(), DataRequired()])
    password = PasswordField(label="Password", validators=[DataRequired()])
    re_password = PasswordField(label="Retype Password", validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField(label="Sign Up")

    def validate_username(self, username):
        if User.query.filter_by(username=username.data).first():
            raise ValidationError("Username exists")

    def validate_email(self, email):
        if email.data.strip() != "":
            if User.query.filter_by(email=email.data).first():
                raise ValidationError("Email exists")

class MessageForm(FlaskForm):
    pass