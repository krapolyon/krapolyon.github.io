"""Website generator for Les Krapos

Generate static pages from templated html files

Templates are based on Jinja2. 
They are located in the TEMPLATES_DIRECTORY folder.

The parameters used to fill the templates are defined in a yaml 
configuration file located at CONFIG_FILE.
"""
import argparse
import yaml

from jinja2 import Environment, FileSystemLoader, select_autoescape

# GLOBAL VARIABLES
CONFIG_FILE_DEFAULT = "./assets/config.yml"

TEMPLATES_DIRECTORY_DEFAULT = "./templates"
TEMPLATES_DEFAULT = ["friends.html", "media.html", "setlist.html"]


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
	with open(config_file, "r") as f:
		config = yaml.load(f, yaml.Loader)
	return config


def make_html(config, templates_directory, template_name, html_name=None):
	"""Generate a html file from a jinja2 template

	Parameters
	----------
	config: dict
		Configuration dictionnary

	templates_directory: str
		Path to templates directory

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
	    loader=FileSystemLoader(templates_directory),
	    autoescape=select_autoescape()
	)
	template = env.get_template(template_name)

	if html_name is None:
		html_name = template_name

	with open(html_name, "w") as f:
		f.write(template.render(**config))

	return html_name


def main(argv=None):
	"""Entry point to render html template"""

	parser = argparse.ArgumentParser(
                    prog='generator',
                    description='Generate html static pages from template')
	parser.add_argument('--config-file', default=CONFIG_FILE_DEFAULT)
	parser.add_argument('--templates-directory', default=TEMPLATES_DIRECTORY_DEFAULT)
	parser.add_argument('template', nargs='*', default=TEMPLATES_DEFAULT)

	args = parser.parse_args(argv)
	config = load_config(args.config_file)
	for template_name in args.template:
		make_html(config, args.templates_directory, template_name)


if __name__ == '__main__':
	main()
