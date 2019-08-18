import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ActivityIndicator} from 'react-native';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: null,
    page: 1,
    refreshing: false,
  };

  async componentDidMount() {
    const {navigation} = this.props;
    this.setState({loading: 1});

    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({stars: response.data, loading: null});
  }

  async componentDidUpdate(_, prevState) {
    const {page} = this.state;

    if (prevState.page !== page) {
      this.moreStarred();
    }
  }

  moreStarred = async () => {
    const {page, stars} = this.state;

    const {navigation} = this.props;

    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        page,
      },
    });

    this.setState({
      stars: [...stars, ...response.data],
    });
  };

  handleNavigate = repository => {
    const {navigation} = this.props;

    navigation.navigate('Repository', {
      repository,
    });
  };

  refreshList = () => {
    this.setState({loading: 1, refreshing: true});

    this.componentDidMount();

    this.setState({loading: null, refreshing: false});
  };

  loadMore = async () => {
    const {page} = this.state;

    const newPage = page + 1;

    this.setState({page: newPage});
  };

  render() {
    const {navigation} = this.props;
    const {stars, loading, refreshing} = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{uri: user.avatar}} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ActivityIndicator color="#eee" size="large" />
        ) : (
          <Stars
            onRefresh={this.refreshList}
            refreshing={refreshing}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            loading={loading}
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({item}) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{uri: item.owner.avatar_url}} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
