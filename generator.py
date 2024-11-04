'''Website generator for Les Krapo'''
import yaml
from wordcloud import WordCloud, get_single_color_func
import matplotlib.pyplot as plt

from jinja2 import Environment, PackageLoader, select_autoescape

# GLOBAL VARIABLES
CONFIG_FILE = "./assets/config.yml"


def load_config(config_file):
	"""Load configuration parameters from yaml config file

	Parameters
	----------
	config_file: str or Path
		Path to configuration file

	Returns
	-------
	dict:
		Dictionnary of configuration parameters
	"""
	with open(CONFIG_FILE, "r") as f:
		config = yaml.load(f, yaml.Loader)
	return config


def make_html(config, template_name, html_name=None):
	"""Generate a html file from a jinja2 template

	Parameters
	----------
	config: dict
		Configuration dictionnary

	file_name: str
		Name of template file

	html_name: str
		Name of output html file (default to template_name)

	Returns
	-------
		str
			Path to generated html file
	"""
	env = Environment(
	    loader=PackageLoader("pykrapo"),
	    autoescape=select_autoescape()
	)

	template = env.get_template(template_name)

	if html_name is None:
		html_name = template_name

	with open(html_name, "w") as f:
		f.write(template.render(**config))

	return html_name


def make_setlist_image(config):
	"""Generate the wordcloud image for the setlist

	Parameters
	----------
	config: dict
		Configuration parameters. Should contain the key 'setlist'
		which is a list of 'tune, artist' data

	Returns
	-------
	str
		Path to generated image
	"""

	setlist = config['setlist']

	# Generate dict of words frequency 
	# Frequency is determined by position in list
	words = {}
	for i, tune in enumerate(setlist):	
		weight = 1
		if i < 3:
			weight = 10
		elif i < 5:
			weight = 5
		elif i < 10:
			weight = 3
		elif i < 20:
			weight = 2
		words[tune['artist'].upper()] = weight

	# Generate a word cloud image
	wordcloud = WordCloud(height=400, width=400, background_color="black", color_func=get_single_color_func("white")).generate_from_frequencies(words)

	# Display the generated image:
	# the matplotlib way:
	
	plt.imshow(wordcloud, interpolation='bilinear')
	plt.axis("off")
	plt.show()

if __name__ == '__main__':
	config = load_config(CONFIG_FILE)
	# make_setlist_image(config)

	for template_name in ["friends.html", "media.html", "setlist.html"]:
		make_html(config, template_name)
