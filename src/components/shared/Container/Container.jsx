import PropTypes from 'prop-types';

import './style.scss';

function Container({ children }) {
  return <div className="container">{children}</div>;
}

export default Container;

Container.propTypes = {
  children: PropTypes.node.isRequired,
};
